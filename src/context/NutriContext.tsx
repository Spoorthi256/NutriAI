import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import {
  UserProfile,
  NutritionProfile,
  DayPlan,
  DeliveryScheduleItem,
  ChatMessage,
  ArtifactType,
  ActiveView,
  AppNavigationTab,
  OnboardingStep,
  Meal,
  ChatThread,
  AppNotification,
} from '../types';
import {
  INITIAL_DELIVERIES,
  INITIAL_USER_PROFILE,
} from '../mock/initialData';
import { useOnboarding } from '../hooks/useOnboarding';
import {
  calculateNutritionTargets,
  generateWeeklyPlan,
  convertToUIDayPlans,
  filterCandidateMeals,
  MEAL_DATASET,
  MealSlot,
} from '../nutrition';
import { callGroqAI, generateGroqMealPlanBriefing } from '../services/groqService';
import {
  saveWeeklyPlan,
  loadWeeklyPlan,
  saveDeliveries,
  loadDeliveries,
  saveChatThreads,
  loadChatThreads,
  saveSubscriptionState,
  loadSubscriptionState,
} from '../utils/storage';

interface NutriContextType {
  userProfile: UserProfile;
  weeklyPlan: DayPlan[];
  deliveries: DeliveryScheduleItem[];
  activeArtifact: ArtifactType;
  activeView: ActiveView;
  activeTab: AppNavigationTab;

  // Subscription & Razorpay State
  hasSubscription: boolean;
  subscriptionPlan: 'weekly' | 'monthly' | 'yearly' | null;
  credits: number;
  redeemCredit: (orderId?: string) => boolean;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  addNotification: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'delivery') => void;
  markNotificationsAsRead: () => void;
  isSubscriptionModalOpen: boolean;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
  activateSubscription: (tier: 'weekly' | 'monthly' | 'yearly') => void;
  cancelSubscription: () => void;

  // Smart Delivery Logistics Controls
  holdDelivery: (days?: number) => void;
  postponeDelivery: (newDateOrSlot?: string) => void;
  cancelDelivery: (orderId?: string) => void;
  markDeliveryOutForDelivery: (orderId: string) => void;
  reportDeliveryDelay: (orderId: string, minutes?: number) => void;

  // Auth flow
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;

  // Chat Threads & Messaging
  chatThreads: ChatThread[];
  activeThreadId: string;
  setActiveThreadId: (id: string) => void;
  createNewChat: () => void;
  resetOnboardingChat: () => void;

  // Active Thread Data
  messages: ChatMessage[];
  isTyping: boolean;
  currentStep: OnboardingStep;
  isComplete: boolean;

  // UI state
  mobileArtifactOpen: boolean;
  setMobileArtifactOpen: (open: boolean) => void;
  setActiveArtifact: (artifact: ArtifactType) => void;
  setActiveView: (view: ActiveView) => void;
  setActiveTab: (tab: AppNavigationTab) => void;

  // User & Engine Actions
  sendMessage: (text: string) => Promise<void>;
  submitInput: (value: string | number, field?: keyof NutritionProfile) => void;
  selectQuickAction: (label: string, value: string, category?: string) => void;
  submitNumberInput: (num: number, field: keyof NutritionProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  generateUserMealPlan: () => DayPlan[];
  replaceMeal: (day: string, mealId: string) => void;
  resetConversation: () => void;
  isGeneratingPlan: boolean;
  startPlanGeneration: (customUserText?: string) => void;
  completePlanGeneration: () => void;
}

const NutriContext = createContext<NutriContextType | undefined>(undefined);

const DEFAULT_CHAT_THREADS: ChatThread[] = [
  {
    id: 'thread-onboarding',
    title: 'Onboarding & Profile Setup',
    time: 'Pinned',
    isPinned: true,
    isOnboarding: true,
    messages: [],
  },
  {
    id: 'thread-assistant-main',
    title: 'Precision Nutrition',
    time: '12:30 PM',
    isPinned: false,
    isOnboarding: false,
    messages: [
      {
        id: 'init-asst-1',
        role: 'ai',
        sender: 'ai',
        content: "Hello! I'm NutriAI, connected to Groq Llama AI. Your personalized nutrition blueprint and 7-day schedule are synchronized.\n\nAsk me anything — I can swap meals, adjust macros, track deliveries, cancel orders, or answer nutrition questions!",
        timestamp: '12:30 PM',
        type: 'text',
      },
    ],
  },
];

export const NutriProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const onboarding = useOnboarding();

  // 1. Deliveries state with localStorage persistence (empty until subscribed)
  const [deliveries, setDeliveries] = useState<DeliveryScheduleItem[]>(() => {
    const savedSub = loadSubscriptionState();
    if (!savedSub?.hasSubscription) return [];
    const saved = loadDeliveries();
    if (saved && saved.length > 0) return saved;
    return [];
  });

  useEffect(() => {
    saveDeliveries(deliveries);
  }, [deliveries]);

  // Helper to generate authentic weekly plan from profile
  const generateUserMealPlan = () => {
    const raw = generateWeeklyPlan(onboarding.profile);
    const converted = convertToUIDayPlans(raw);
    setWeeklyPlan(converted);
    saveWeeklyPlan(converted);
    return converted;
  };

  // 2. Weekly plan state with localStorage persistence (empty until onboarding is complete)
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(() => {
    if (!onboarding.isComplete) return [];
    const saved = loadWeeklyPlan();
    if (saved && saved.length > 0) return saved;
    const raw = generateWeeklyPlan(onboarding.profile);
    return convertToUIDayPlans(raw);
  });

  useEffect(() => {
    saveWeeklyPlan(weeklyPlan);
  }, [weeklyPlan]);

  // 3. Chat threads state with localStorage persistence
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    const saved = loadChatThreads();
    if (saved && saved.length > 0) {
      // Ensure onboarding thread is always present and pinned at top
      const hasOnboarding = saved.some((t) => t.id === 'thread-onboarding');
      if (!hasOnboarding) {
        return [DEFAULT_CHAT_THREADS[0], ...saved];
      }
      return saved;
    }
    return DEFAULT_CHAT_THREADS;
  });

  useEffect(() => {
    saveChatThreads(chatThreads);
  }, [chatThreads]);

  // Active thread selection
  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    // If onboarding is incomplete, start with onboarding thread; otherwise main assistant thread
    return onboarding.isComplete ? 'thread-assistant-main' : 'thread-onboarding';
  });

  const [activeArtifact, setActiveArtifact] = useState<ArtifactType>('nutrition_profile');
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [activeTab, setActiveTab] = useState<AppNavigationTab>('home');
  const [mobileArtifactOpen, setMobileArtifactOpen] = useState<boolean>(false);
  const [groqTyping, setGroqTyping] = useState<boolean>(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);

  const completePlanGeneration = () => {
    setIsGeneratingPlan(false);
    setActiveTab('meals');
    setActiveArtifact('weekly_meal_plan');
    addNotification(
      '✨ 7-Day Meal Plan Ready',
      'Your personalized meal schedule has been created! Review your plan and subscribe to activate daily deliveries.',
      'success'
    );
  };

  // Subscription state (persisted)
  const [hasSubscription, setHasSubscription] = useState<boolean>(() => {
    const saved = loadSubscriptionState();
    return saved?.hasSubscription || false;
  });

  const [subscriptionPlan, setSubscriptionPlan] = useState<'weekly' | 'monthly' | 'yearly' | null>(() => {
    const saved = loadSubscriptionState();
    return (saved?.tier as any) || null;
  });

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [customMacroTargets, setCustomMacroTargets] = useState<{
    dailyCalories?: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatGrams?: number;
  }>({});

  const openSubscriptionModal = () => setIsSubscriptionModalOpen(true);
  const closeSubscriptionModal = () => setIsSubscriptionModalOpen(false);

  // Credits state: week: 7, month: 30, year: 400
  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem('nutriai_credits');
    if (saved !== null) return parseInt(saved, 10);
    const savedSub = loadSubscriptionState();
    if (savedSub?.hasSubscription) {
      if (savedSub.tier === 'weekly') return 7;
      if (savedSub.tier === 'monthly') return 30;
      if (savedSub.tier === 'yearly') return 400;
    }
    return 0;
  });

  useEffect(() => {
    localStorage.setItem('nutriai_credits', credits.toString());
  }, [credits]);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Precision Blueprint Calibrated',
      message: 'Your personalized metabolic targets and dietary guidelines are active.',
      time: 'Just now',
      read: false,
      type: 'success',
    },
    {
      id: 'notif-2',
      title: 'AI Coach Synchronization',
      message: 'Groq AI high-volume hypertrophy engine ready for meal swaps and logistics.',
      time: '5m ago',
      read: false,
      type: 'info',
    },
  ]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const addNotification = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'delivery' = 'info'
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      time: 'Just now',
      read: false,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const redeemCredit = (orderId?: string) => {
    if (credits <= 0) {
      addNotification(
        'No Credits Remaining',
        'Please recharge or renew your subscription plan to redeem meals.',
        'warning'
      );
      return false;
    }
    const newCount = Math.max(0, credits - 1);
    setCredits(newCount);
    localStorage.setItem('nutriai_credits', newCount.toString());

    setDeliveries((prev) => {
      let matched = false;
      const updated = prev.map((d) => {
        if (orderId) {
          if (d.id === orderId || d.orderId === orderId || d.qrCodeId === orderId) {
            matched = true;
            return { ...d, status: 'Delivered' as const };
          }
        } else if (!matched && d.status !== 'Delivered' && d.status !== 'Cancelled') {
          matched = true;
          return { ...d, status: 'Delivered' as const };
        }
        return d;
      });
      saveDeliveries(updated);
      return updated;
    });

    addNotification(
      'Meal Pass Redeemed (-1 Credit)',
      `Your chef-crafted meal pass was verified and redeemed. Remaining meal credits: ${newCount}.`,
      'delivery'
    );
    return true;
  };

  const cancelSubscription = () => {
    setHasSubscription(false);
    setSubscriptionPlan(null);
    saveSubscriptionState({ hasSubscription: false, tier: null });
    addNotification(
      'Subscription Cancelled',
      'Your meal subscription has been downgraded to the Free tier. Doorstep dispatches are paused.',
      'warning'
    );
  };

  const markDeliveryOutForDelivery = (orderId: string) => {
    setDeliveries((prev) => {
      const updated = prev.map((d) =>
        d.id === orderId || d.orderId === orderId || d.qrCodeId === orderId
          ? { ...d, status: 'Out for Delivery' as const }
          : d
      );
      saveDeliveries(updated);
      return updated;
    });
    addNotification(
      'Courier Dispatched',
      `Order ${orderId} is now Out for Delivery! Courier Rajesh Sharma is heading to your address.`,
      'delivery'
    );
  };

  const reportDeliveryDelay = (orderId: string, minutes: number = 15) => {
    setDeliveries((prev) => {
      const updated = prev.map((d) =>
        d.id === orderId || d.orderId === orderId || d.qrCodeId === orderId
          ? { ...d, timeSlot: `${d.timeSlot} (+${minutes}m delay due to traffic)` }
          : d
      );
      saveDeliveries(updated);
      return updated;
    });
    addNotification(
      'Delivery Update',
      `Courier reported a slight delay (+${minutes}m) due to Noida Expressway traffic.`,
      'info'
    );
  };

  const activateSubscription = (tier: 'weekly' | 'monthly' | 'yearly') => {
    setHasSubscription(true);
    setSubscriptionPlan(tier);
    saveSubscriptionState({ hasSubscription: true, tier });

    const tierCredits = tier === 'weekly' ? 7 : tier === 'monthly' ? 30 : 400;
    setCredits(tierCredits);
    localStorage.setItem('nutriai_credits', tierCredits.toString());

    const activeMeals = weeklyPlan.length > 0 ? weeklyPlan : generateUserMealPlan();
    const monLunch = activeMeals[0]?.meals.find((m) => m.category === 'Lunch')?.name || 'Paneer Tikka Brown Rice Bowl with Mint Gravy';
    const monDinner = activeMeals[0]?.meals.find((m) => m.category === 'Dinner')?.name || 'High-Protein Red Lentil Penne with Cremini Garlic Alfredo';
    const tueLunch = activeMeals[1]?.meals.find((m) => m.category === 'Lunch')?.name || 'Tandoori Paneer Power Bowl with Tri-Color Quinoa';
    const tueDinner = activeMeals[1]?.meals.find((m) => m.category === 'Dinner')?.name || 'Paneer & Spinach Kofta Curry with Multigrain Roti';

    const newDeliveries: DeliveryScheduleItem[] = [
      {
        id: `del-1-${Date.now()}`,
        orderId: 'ORD-8492',
        day: 'Monday',
        mealName: monLunch,
        mealCategory: 'Lunch',
        status: 'Out for Delivery',
        timeSlot: '12:45 PM – 1:15 PM',
        address: 'Sector 62, Green Park Towers, Flat 402, Noida (201309)',
        qrCodeId: 'NUTRI-PASS-9921',
      },
      {
        id: `del-2-${Date.now()}`,
        orderId: 'ORD-8493',
        day: 'Monday',
        mealName: monDinner,
        mealCategory: 'Dinner',
        status: 'Preparing',
        timeSlot: '7:45 PM – 8:15 PM',
        address: 'Sector 62, Green Park Towers, Flat 402, Noida (201309)',
        qrCodeId: 'NUTRI-PASS-9922',
      },
      {
        id: `del-3-${Date.now()}`,
        orderId: 'ORD-8494',
        day: 'Tuesday',
        mealName: tueLunch,
        mealCategory: 'Lunch',
        status: 'Scheduled',
        timeSlot: '12:45 PM – 1:15 PM',
        address: 'Sector 62, Green Park Towers, Flat 402, Noida (201309)',
        qrCodeId: 'NUTRI-PASS-9923',
      },
      {
        id: `del-4-${Date.now()}`,
        orderId: 'ORD-8495',
        day: 'Tuesday',
        mealName: tueDinner,
        mealCategory: 'Dinner',
        status: 'Scheduled',
        timeSlot: '7:45 PM – 8:15 PM',
        address: 'Sector 62, Green Park Towers, Flat 402, Noida (201309)',
        qrCodeId: 'NUTRI-PASS-9924',
      },
    ];
    setDeliveries(newDeliveries);
    saveDeliveries(newDeliveries);

    addNotification(
      `Plan Activated: ${tier.toUpperCase()}`,
      `Successfully unlocked Doorstep Deliveries with ${tierCredits} meal credits credited!`,
      'success'
    );
  };

  // Compute calculated nutrition targets via the Phase 3 Nutrition Engine
  const calculatedTargets = useMemo(() => {
    return calculateNutritionTargets(onboarding.profile);
  }, [onboarding.profile]);

  // Compute full UserProfile with real engine calculated metrics
  const userProfile: UserProfile = useMemo(() => {
    return {
      ...onboarding.profile,
      name: onboarding.profile.name || 'Yuvraj',
      goal: onboarding.profile.goal || 'muscle_gain',
      weightKg: onboarding.profile.weightKg || 87,
      heightCm: onboarding.profile.heightCm || 178,
      activityLevel: onboarding.profile.activityLevel || 'moderate',
      dietType: onboarding.profile.dietType || 'vegetarian',
      allergies: onboarding.profile.allergies || [],
      dailyCalories: customMacroTargets.dailyCalories ?? calculatedTargets.dailyCalories,
      proteinGrams: customMacroTargets.proteinGrams ?? calculatedTargets.proteinGrams,
      carbsGrams: customMacroTargets.carbsGrams ?? calculatedTargets.carbsGrams,
      fatGrams: customMacroTargets.fatGrams ?? calculatedTargets.fatGrams,
      hasSubscription,
      subscriptionTier: subscriptionPlan,
    };
  }, [onboarding.profile, calculatedTargets, customMacroTargets, hasSubscription, subscriptionPlan]);

  // Regenerate plan when profile changes, only if onboarding is complete
  const prevProfileSig = useRef<string>('');
  useEffect(() => {
    if (!onboarding.isComplete) return;
    const profileSig = JSON.stringify({
      goal: onboarding.profile.goal,
      diet: onboarding.profile.dietType,
      w: onboarding.profile.weightKg,
      h: onboarding.profile.heightCm,
      age: onboarding.profile.age,
      g: onboarding.profile.gender,
      act: onboarding.profile.activityLevel,
      meals: onboarding.profile.mealsPerDay,
      train: onboarding.profile.trainingDays,
      allergies: onboarding.profile.allergies,
      dislikes: onboarding.profile.dislikedFoods,
    });

    if (profileSig !== prevProfileSig.current) {
      prevProfileSig.current = profileSig;
      const rawPlan = generateWeeklyPlan(onboarding.profile);
      const converted = convertToUIDayPlans(rawPlan);
      setWeeklyPlan(converted);
      saveWeeklyPlan(converted);
    }
  }, [onboarding.profile, onboarding.isComplete]);

  // Active messages based on current thread
  const activeThread = useMemo(() => {
    return chatThreads.find((t) => t.id === activeThreadId) || chatThreads[0];
  }, [chatThreads, activeThreadId]);

  const messages: ChatMessage[] = useMemo(() => {
    if (activeThreadId === 'thread-onboarding') {
      return onboarding.messages as ChatMessage[];
    }
    return activeThread.messages || [];
  }, [activeThreadId, onboarding.messages, activeThread]);

  const isTyping = activeThreadId === 'thread-onboarding' ? onboarding.isTyping : groqTyping;

  // Create a new conversational chat thread (placed below pinned onboarding thread)
  const createNewChat = () => {
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: 'Nutrition Assistant',
      time: 'Just now',
      isPinned: false,
      isOnboarding: false,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'ai',
          sender: 'ai',
          content: "Hello! I'm NutriAI with Groq AI connected. What would you like to explore today? I can help swap meals, manage deliveries, or calibrate your nutrition targets.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
        },
      ],
    };

    setChatThreads((prev) => {
      const pinned = prev.filter((t) => t.isPinned);
      const regular = prev.filter((t) => !t.isPinned);
      return [...pinned, newThread, ...regular];
    });

    setActiveThreadId(newThread.id);
  };

  // Reset Onboarding flow (only for onboarding thread)
  const resetOnboardingChat = () => {
    onboarding.resetOnboarding();
    setWeeklyPlan([]);
    saveWeeklyPlan([]);
    setDeliveries([]);
    saveDeliveries([]);
    setHasSubscription(false);
    setSubscriptionPlan(null);
    saveSubscriptionState({ hasSubscription: false, tier: null });
    setActiveThreadId('thread-onboarding');
    setActiveArtifact('nutrition_profile');
  };

  // Cancel Delivery Order
  const cancelDelivery = (orderId?: string) => {
    setDeliveries((prev) => {
      let cancelled = false;
      return prev.map((item) => {
        if (!cancelled && (!orderId || item.id === orderId || item.orderId === orderId)) {
          cancelled = true;
          return { ...item, status: 'Cancelled' as const };
        }
        return item;
      });
    });
  };

  // Smart Hold Delivery (pause dispatch for N days)
  const holdDelivery = (days = 3) => {
    setDeliveries((prev) =>
      prev.map((item, idx) =>
        idx === 0
          ? {
              ...item,
              day: `Hold (${days} days)`,
              timeSlot: 'Delivery paused on hold',
            }
          : item
      )
    );
  };

  // Smart Postpone Delivery to an alternate window
  const postponeDelivery = (newSlot = 'Tomorrow Evening (7:30 PM - 8:15 PM)') => {
    setDeliveries((prev) =>
      prev.map((item, idx) =>
        idx === 0
          ? {
              ...item,
              day: 'Tomorrow',
              timeSlot: newSlot,
            }
          : item
      )
    );
  };

  // Replace Meal Slot by Category and Day
  const replaceMealSlot = (dayName: string, category: string, reason?: string) => {
    let replacedName = '';
    setWeeklyPlan((prevPlan) =>
      prevPlan.map((day) => {
        if (day.day.toLowerCase() === dayName.toLowerCase()) {
          const targetMeal = day.meals.find(
            (m) => m.category.toLowerCase() === category.toLowerCase()
          );
          if (!targetMeal) return day;

          const slot: MealSlot = targetMeal.category.toLowerCase() as MealSlot;
          const candidates = filterCandidateMeals(MEAL_DATASET, onboarding.profile, slot);

          const currentMealNames = day.meals.map((m) => m.name.toLowerCase());
          const replacement =
            candidates.find((c) => !currentMealNames.includes(c.name.toLowerCase())) ||
            candidates[0];

          if (!replacement) return day;
          replacedName = replacement.name;

          const updatedMeal: Meal = {
            id: `${replacement.id}-${day.shortDay.toLowerCase()}-swap-${Date.now()}`,
            name: replacement.name,
            category: targetMeal.category,
            calories: replacement.calories,
            protein: replacement.protein,
            carbs: replacement.carbs,
            fat: replacement.fat,
            prepTime: replacement.prepTime,
            tag: reason || 'Groq AI Swapped',
            description: replacement.description,
            ingredients: replacement.ingredients,
          };

          const newMeals = day.meals.map((m) => (m.id === targetMeal.id ? updatedMeal : m));
          return {
            ...day,
            meals: newMeals,
            totalCalories: newMeals.reduce((acc, m) => acc + m.calories, 0),
            totalProtein: newMeals.reduce((acc, m) => acc + m.protein, 0),
          };
        }
        return day;
      })
    );
    return replacedName;
  };

  // Replace a specific meal with candidate
  const replaceMeal = (dayName: string, mealId: string) => {
    setWeeklyPlan((prevPlan) =>
      prevPlan.map((day) => {
        if (day.day.toLowerCase() === dayName.toLowerCase()) {
          const targetMeal = day.meals.find((m) => m.id === mealId);
          if (!targetMeal) return day;

          const slot: MealSlot = targetMeal.category.toLowerCase() as MealSlot;
          const candidates = filterCandidateMeals(MEAL_DATASET, onboarding.profile, slot);
          const currentMealNames = day.meals.map((m) => m.name.toLowerCase());
          const replacement =
            candidates.find((c) => !currentMealNames.includes(c.name.toLowerCase())) ||
            candidates[0];

          if (!replacement) return day;

          const updatedMeal: Meal = {
            id: `${replacement.id}-${day.shortDay.toLowerCase()}-swap-${Date.now()}`,
            name: replacement.name,
            category: targetMeal.category,
            calories: replacement.calories,
            protein: replacement.protein,
            carbs: replacement.carbs,
            fat: replacement.fat,
            prepTime: replacement.prepTime,
            tag: 'AI Swapped Choice',
            description: replacement.description,
            ingredients: replacement.ingredients,
          };

          const newMeals = day.meals.map((m) => (m.id === mealId ? updatedMeal : m));
          return {
            ...day,
            meals: newMeals,
            totalCalories: newMeals.reduce((acc, m) => acc + m.calories, 0),
            totalProtein: newMeals.reduce((acc, m) => acc + m.protein, 0),
          };
        }
        return day;
      })
    );
  };

  // Submit Answer from Onboarding Question / Form
  const submitInput = (value: string | number, field?: keyof NutritionProfile) => {
    if (field === 'name') {
      onboarding.setProfileField('name', String(value).trim());
    }
    onboarding.submitAnswer(value, field);
  };

  // Primary Send Message Action
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check if user asked to build or generate meal plan in chat
    const lower = text.trim().toLowerCase();
    if (
      lower === 'build meal' ||
      lower === 'build meal plan' ||
      lower === 'build my meal plan' ||
      lower === 'generate meal plan' ||
      lower === 'create meal plan' ||
      lower.startsWith('build meal')
    ) {
      startPlanGeneration(text.trim());
      return;
    }

    // A. If currently in Pinned Onboarding Thread:
    if (activeThreadId === 'thread-onboarding') {
      if (onboarding.currentStep !== 'PROFILE_COMPLETE') {
        onboarding.submitAnswer(text);
        return;
      }
    }

    // B. Regular Conversational Thread with Groq AI:
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      sender: 'user',
      content: text,
      timestamp,
      type: 'text',
    };

    // Append user message immediately
    setChatThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === activeThreadId) {
          const currentMsgs = thread.messages || [];
          return {
            ...thread,
            messages: [...currentMsgs, userMsg],
            time: timestamp,
          };
        }
        return thread;
      })
    );

    setGroqTyping(true);

    try {
      // Prepare conversation history for Groq
      const history = [...messages, userMsg].map((m) => ({
        role: (m.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.content,
      }));

      // Call Groq AI with tool calling capabilities
      const responseText = await callGroqAI(
        history,
        userProfile,
        weeklyPlan,
        deliveries,
        {
          onSwapMeal: async (day, category, reason) => {
            const newMealName = replaceMealSlot(day, category, reason);
            setActiveArtifact('weekly_meal_plan');
            return {
              success: true,
              message: `Swapped ${day} ${category} with ${newMealName || 'selected high-protein recipe'}.`,
              newMealName,
            };
          },
          onCancelDelivery: async (orderId) => {
            cancelDelivery(orderId);
            return {
              success: true,
              message: `Delivery order has been cancelled in your schedule.`,
            };
          },
          onTrackDelivery: async () => {
            const next = deliveries[0];
            return {
              success: true,
              details: next
                ? {
                    orderId: next.orderId,
                    mealName: next.mealName,
                    status: next.status,
                    timeSlot: next.timeSlot,
                    address: next.address,
                    riderStatus: 'Rider arriving in 18 mins',
                  }
                : { status: 'No active delivery scheduled' },
            };
          },
          onHoldDelivery: async (days) => {
            holdDelivery(days);
            return {
              success: true,
              message: `Deliveries placed on hold for ${days || 3} days. Resumes automatically.`,
            };
          },
          onPostponeDelivery: async (newSlot) => {
            postponeDelivery(newSlot);
            return {
              success: true,
              message: `Delivery rescheduled to ${newSlot || 'Tomorrow Evening (7:30 PM - 8:15 PM)'}.`,
            };
          },
          onRegeneratePlan: async () => {
            const freshPlan = generateUserMealPlan();
            return {
              success: true,
              message: `Generated fresh 7-day meal plan with ${freshPlan.length} calibrated daily schedules.`,
            };
          },
          onUpdateProfile: async (updates) => {
            onboarding.setProfileField('dailyCalories' as any, updates.dailyCalories);
            if (updates.goal) onboarding.setProfileField('goal', updates.goal as any);
            if (updates.dietType) onboarding.setProfileField('dietType', updates.dietType as any);
            return {
              success: true,
              message: `Updated profile targets.`,
            };
          },
          onCancelSubscription: async () => {
            cancelSubscription();
            return {
              success: true,
              message: `Subscription successfully cancelled and account downgraded to Free tier. Doorstep dispatches paused.`,
            };
          },
          onUpgradeSubscription: async (tier) => {
            openSubscriptionModal();
            return {
              success: true,
              message: `Opened Subscription Modal with Weekly (7 credits @ ₹999), Monthly Pro (30 credits @ ₹2,999), and Annual Elite (400 credits @ ₹24,999) plans.`,
            };
          },
          onOpenDeliveryPartner: async () => {
            setActiveView('delivery_partner');
            return {
              success: true,
              message: `Navigated to the Delivery Partner / Courier logistics scanning console.`,
            };
          },
        }
      );

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        sender: 'ai',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };

      setChatThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === activeThreadId) {
            return {
              ...thread,
              messages: [...(thread.messages || []), aiMsg],
            };
          }
          return thread;
        })
      );
    } catch (err) {
      console.warn('Groq AI error, using fallback response:', err);

      const lower = text.toLowerCase();
      let fallbackText = "I have noted your request. Your 7-day meal schedule and daily macro targets remain synchronized.";

      if (lower.includes('cancel') && lower.includes('delivery')) {
        cancelDelivery();
        fallbackText = "I have updated your schedule: Your upcoming meal delivery has been **Cancelled**.";
      } else if (lower.includes('hold') && lower.includes('delivery')) {
        holdDelivery(3);
        fallbackText = "I have placed your deliveries on **3-day hold**. Deliveries will resume automatically.";
      } else if (lower.includes('postpone') || lower.includes('reschedule')) {
        postponeDelivery('Tomorrow Evening (7:30 PM - 8:15 PM)');
        fallbackText = "I have rescheduled your upcoming delivery to **Tomorrow Evening (7:30 PM - 8:15 PM)**.";
      } else if (lower.includes('generate') && (lower.includes('plan') || lower.includes('new plan'))) {
        generateUserMealPlan();
        fallbackText = "I have refreshed and re-optimized your complete **7-day personalized meal schedule**!";
      } else if (lower.includes('track') || lower.includes('time') || lower.includes('arrive') || lower.includes('delivery')) {
        const next = deliveries[0];
        fallbackText = next
          ? `Your active delivery **#${next.orderId}** (${next.mealName}) is **${next.status}**. The rider is currently en route and arriving in **18 mins** (${next.timeSlot}) at ${next.address}.`
          : "You currently have no active deliveries scheduled.";
      } else if (lower.includes('swap') || lower.includes('change meal')) {
        replaceMealSlot('Wednesday', 'Lunch');
        fallbackText = "I've updated your meal schedule with a fresh high-protein alternative.";
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        sender: 'ai',
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };

      setChatThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === activeThreadId) {
            return {
              ...thread,
              messages: [...(thread.messages || []), aiMsg],
            };
          }
          return thread;
        })
      );
    } finally {
      setGroqTyping(false);
    }
  };

  const startPlanGeneration = (customUserText?: string) => {
    const userText = customUserText || 'Build My Meal Plan 📅';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Mark onboarding complete
    onboarding.confirmProfile();

    // 2. Generate authentic personalized meal plan based on user's profile
    const newPlan = generateUserMealPlan();

    // Add user prompt message to onboarding chat
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      sender: 'user',
      content: userText,
      timestamp,
      type: 'text',
    };
    onboarding.addDirectMessage(userMsg);

    // Indicate Groq AI generation
    onboarding.setIsTyping(true);

    // Invoke Groq AI to generate personalized plan launch briefing (with 3000 max_tokens)
    generateGroqMealPlanBriefing(userProfile, newPlan)
      .then((briefingText) => {
        const aiMsg: ChatMessage = {
          id: `msg-ai-plan-${Date.now()}`,
          role: 'ai',
          sender: 'ai',
          content: briefingText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
        };
        onboarding.addDirectMessage(aiMsg);
      })
      .catch((err) => {
        console.warn('Groq meal plan synthesis error:', err);
      })
      .finally(() => {
        onboarding.setIsTyping(false);
      });

    // Launch authentic 5-step clinical synthesis loader modal instead of instant teleport!
    setIsGeneratingPlan(true);
  };

  const selectQuickAction = (label: string, value: string, category?: string) => {
    if (value === 'build_meal_plan') {
      startPlanGeneration(label || 'Build My Meal Plan 📅');
      return;
    }

    if (value === 'confirm_profile') {
      startPlanGeneration('Looks Good! Build Plan ✨');
      return;
    }

    if (value === 'edit_profile') {
      onboarding.editStep('GOAL');
      return;
    }

    let fieldToUpdate: keyof NutritionProfile | undefined = undefined;
    if (category === 'gender') {
      const genderVal = value === 'neutral' ? null : value;
      onboarding.setProfileField('gender', genderVal);
      onboarding.submitAnswer(label, undefined);
      return;
    }
    if (category === 'goal') fieldToUpdate = 'goal';
    else if (category === 'activity') fieldToUpdate = 'activityLevel';
    else if (category === 'diet') fieldToUpdate = 'dietType';
    else if (category === 'allergy') fieldToUpdate = 'allergies';
    else if (category === 'dislike') fieldToUpdate = 'dislikedFoods';
    else if (category === 'meals') {
      onboarding.setProfileField('mealsPerDay', parseInt(value, 10));
      onboarding.submitAnswer(label, undefined);
      return;
    } else if (category === 'training') {
      onboarding.setProfileField('trainingDays', parseInt(value, 10));
      onboarding.submitAnswer(label, undefined);
      return;
    }

    onboarding.submitAnswer(label, fieldToUpdate);
  };

  const submitNumberInput = (num: number, field: keyof NutritionProfile) => {
    const label = `${num} ${field === 'heightCm' ? 'cm' : field === 'weightKg' ? 'kg' : field === 'age' ? 'years' : ''}`.trim();
    onboarding.submitAnswer(label, field);
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    if (
      partial.dailyCalories !== undefined ||
      partial.proteinGrams !== undefined ||
      partial.carbsGrams !== undefined ||
      partial.fatGrams !== undefined
    ) {
      setCustomMacroTargets((prev) => ({
        ...prev,
        ...(partial.dailyCalories !== undefined && { dailyCalories: partial.dailyCalories }),
        ...(partial.proteinGrams !== undefined && { proteinGrams: partial.proteinGrams }),
        ...(partial.carbsGrams !== undefined && { carbsGrams: partial.carbsGrams }),
        ...(partial.fatGrams !== undefined && { fatGrams: partial.fatGrams }),
      }));
    }
    Object.entries(partial).forEach(([k, v]) => {
      if (k in onboarding.profile) {
        onboarding.setProfileField(k as keyof NutritionProfile, v);
      }
    });
  };

  const resetConversation = () => {
    resetOnboardingChat();
  };

  return (
    <NutriContext.Provider
      value={{
        userProfile,
        weeklyPlan,
        deliveries,
        activeArtifact,
        activeView,
        activeTab,
        chatThreads,
        activeThreadId,
        setActiveThreadId,
        createNewChat,
        resetOnboardingChat,
        messages,
        isTyping,
        currentStep: onboarding.currentStep,
        isComplete: onboarding.isComplete,
        mobileArtifactOpen,
        setMobileArtifactOpen,
        setActiveArtifact,
        setActiveView,
        setActiveTab,
        hasSubscription,
        subscriptionPlan,
        credits,
        redeemCredit,
        notifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationsAsRead,
        isSubscriptionModalOpen,
        openSubscriptionModal,
        closeSubscriptionModal,
        activateSubscription,
        cancelSubscription,
        holdDelivery,
        postponeDelivery,
        cancelDelivery,
        markDeliveryOutForDelivery,
        reportDeliveryDelay,
        authMode,
        setAuthMode,
        sendMessage,
        submitInput,
        selectQuickAction,
        submitNumberInput,
        updateProfile,
        generateUserMealPlan,
        replaceMeal,
        resetConversation,
        isGeneratingPlan,
        startPlanGeneration,
        completePlanGeneration,
      }}
    >
      {children}
    </NutriContext.Provider>
  );
};

export const useNutri = () => {
  const context = useContext(NutriContext);
  if (!context) {
    throw new Error('useNutri must be used within a NutriProvider');
  }
  return context;
};
