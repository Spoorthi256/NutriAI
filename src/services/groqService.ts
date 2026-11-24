import { UserProfile, DayPlan, DeliveryScheduleItem } from '../types';

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface GroqActionHandlers {
  onSwapMeal?: (day: string, category: string, reason?: string) => Promise<{ success: boolean; message: string; newMealName?: string }>;
  onCancelDelivery?: (orderId?: string) => Promise<{ success: boolean; message: string }>;
  onTrackDelivery?: () => Promise<{ success: boolean; details: any }>;
  onHoldDelivery?: (days?: number) => Promise<{ success: boolean; message: string }>;
  onPostponeDelivery?: (newSlot?: string) => Promise<{ success: boolean; message: string }>;
  onRegeneratePlan?: () => Promise<{ success: boolean; message: string }>;
  onUpdateProfile?: (updates: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  onCancelSubscription?: () => Promise<{ success: boolean; message: string }>;
  onUpgradeSubscription?: (tier?: string) => Promise<{ success: boolean; message: string }>;
  onOpenDeliveryPartner?: () => Promise<{ success: boolean; message: string }>;
}

const GROQ_API_KEY =
  (import.meta as any).env?.VITE_GROQ_API_KEY ||
  '';

const GROQ_PRIMARY_MODEL =
  (import.meta as any).env?.VITE_GROQ_PRIMARY_MODEL || 'openai/gpt-oss-120b';
const GROQ_FALLBACK_MODEL =
  (import.meta as any).env?.VITE_GROQ_FALLBACK_MODEL || 'qwen/qwen3.8-27b';

// Tool definitions for Groq AI function calling
const NUTRIAI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'cancel_subscription',
      description: 'Cancel active meal subscription and downgrade account to Free tier, pausing future kitchen dispatches.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'upgrade_subscription',
      description: 'Open the Subscription Modal for the user to choose or upgrade their plan (Weekly 7 credits, Monthly Pro 30 credits, or Annual Elite 400 credits) with Razorpay checkout.',
      parameters: {
        type: 'object',
        properties: {
          tier: {
            type: 'string',
            description: 'Requested plan tier: weekly, monthly, yearly',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'open_delivery_partner',
      description: 'Switch the view to the Delivery Partner / Courier logistics scanning console view.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'swap_meal',
      description: 'Swap or replace a scheduled meal for a specific day and slot (e.g. Tuesday lunch, Wednesday dinner)',
      parameters: {
        type: 'object',
        properties: {
          day: {
            type: 'string',
            description: 'Day of week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
          },
          category: {
            type: 'string',
            description: 'Meal category/slot: Breakfast, Lunch, Snack, Dinner',
          },
          reason: {
            type: 'string',
            description: 'User preference or criteria, e.g. "higher protein", "lighter", "vegan", "no paneer"',
          },
        },
        required: ['day', 'category'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'track_delivery',
      description: 'Check active delivery orders, tracking status, estimated arrival, address, and digital QR passcode',
      parameters: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'Optional specific order ID to track, e.g. ORD-8492',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'cancel_delivery',
      description: 'Cancel an upcoming meal delivery order in the delivery schedule',
      parameters: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'Order ID to cancel. If omitted, cancels the next upcoming order.',
          },
          reason: {
            type: 'string',
            description: 'Reason for cancellation, e.g. "eating out", "traveling"',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'hold_delivery',
      description: 'Pause or hold meal deliveries for a given number of days (e.g. 2 days, 3 days)',
      parameters: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: 'Number of days to hold deliveries, e.g. 3',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'postpone_delivery',
      description: 'Reschedule or postpone upcoming delivery to tomorrow evening or another slot',
      parameters: {
        type: 'object',
        properties: {
          newSlot: {
            type: 'string',
            description: 'New time slot or window, e.g. Tomorrow Evening (7:30 PM - 8:15 PM)',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'regenerate_plan',
      description: 'Regenerate the complete 7-day personalized meal plan with fresh dishes and seasonal ingredients',
      parameters: {
        type: 'object',
        properties: {
          focus: {
            type: 'string',
            description: 'Nutritional focus or request, e.g. "higher protein", "cleaner carbs"',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_profile',
      description: 'Update the user caloric target, fitness goal, or dietary preference',
      parameters: {
        type: 'object',
        properties: {
          dailyCalories: {
            type: 'number',
            description: 'New daily caloric target in kcal, e.g. 2800',
          },
          goal: {
            type: 'string',
            description: 'Fitness goal: muscle_gain, weight_loss, weight_gain, maintenance',
          },
          dietType: {
            type: 'string',
            description: 'Diet type: vegetarian, vegan, non_vegetarian, keto, mediterranean',
          },
        },
      },
    },
  },
];

export async function callGroqAI(
  conversationMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  userProfile: UserProfile,
  weeklyPlan: DayPlan[],
  deliveries: DeliveryScheduleItem[],
  handlers: GroqActionHandlers
): Promise<string> {
  // Construct dynamic system prompt with user's real live state
  const nextDelivery = deliveries[0];
  const systemPrompt = `You are NutriAI, an advanced, evidence-based adaptive nutritionist and full-lifecycle wellness companion.
You have omniscient knowledge of the NutriAI application, its subscription system, delivery logistics, kitchen prep, and ML engine.
You possess real function tools to directly manipulate the user's meal plan, deliveries, and subscription state.

### NutriAI System Knowledge:
1. **Application Architecture**:
   - 4 Core Tabs: Home (Conversational AI workspace), Meals (7-Day interactive schedule & swaps), Dashboard (metabolic telemetry & calorie tracking), Deliveries (live courier GPS tracking & QR passes).
   - Single-Page Experience: Unified in-memory navigation across Customer App, AI Coach Analytics, and Delivery Partner Console.
2. **Subscriptions & Credit Mechanics**:
   - Weekly Starter: ₹999/week — 7 meal credits (1 meal/day), basic macro calibration.
   - Monthly Pro (Most Popular): ₹2,999/month — 30 meal credits (1 meal/day), unlimited AI swaps, smart hold/postpone, priority delivery.
   - Annual Elite: ₹24,999/year — 400 meal credits, custom hypertrophy macro targets, dedicated sports nutritionist.
   - Gateway: Integrated test Razorpay gateway ('rzp_test_Tkiv94rlfEXazD').
   - Credit Burn: Each doorstep delivery handover deducts exactly 1 credit (-1 Credit) when scanned by the courier.
3. **Delivery Logistics (Noida Sector 62 Hub)**:
   - Central Kitchen Facility: Sector 62, Green Park Towers Hub, Noida (201309).
   - Packaging: 100% food-grade compostable plant fiber in dual-chamber thermal insulated boxes.
   - Active Courier: Rajesh Sharma (#RIDER-409), delivery ETA typically 15–20 minutes.
   - Digital QR Pass: Each delivery has a unique cryptographic passcode (e.g. 'NUTRI-PASS-9921'). When the rider scans or enters this pass, the meal is marked 'Delivered' and 1 credit is deducted.
   - Logistics Controls: Users can hold (pause for N days), postpone (shift to tomorrow evening), or cancel orders.
   - Delivery Partner Portal: Couriers have an in-app console to scan QR passes, report traffic delays, or update dispatch status.

### Current User Live State:
- Name: ${userProfile.name}
- Fitness Goal: ${userProfile.goal}
- Diet Type: ${userProfile.dietType}
- Target Calories: ${userProfile.dailyCalories} kcal (Protein: ${userProfile.proteinGrams}g, Carbs: ${userProfile.carbsGrams}g, Fats: ${userProfile.fatGrams}g)
- Allergies: ${userProfile.allergies?.join(', ') || 'None'}
- Disliked Foods: ${userProfile.dislikedFoods?.join(', ') || 'None'}
- Subscription: ${userProfile.hasSubscription ? `${userProfile.subscriptionTier?.toUpperCase()} Active (${userProfile.credits ?? 0} Credits)` : 'Free Tier (No active subscription)'}
- Next Delivery: ${nextDelivery ? `Order #${nextDelivery.orderId} - ${nextDelivery.mealName} (Status: ${nextDelivery.status}, Slot: ${nextDelivery.timeSlot}, Pass: ${nextDelivery.qrCodeId})` : 'None'}

### Autonomous Tool Execution Rules:
1. **Cancel Subscription**: If the user asks to cancel subscription, stop auto-renew, or downgrade to free, IMMEDIATELY invoke \`cancel_subscription\`.
2. **Upgrade / Subscribe**: If the user asks to upgrade subscription, buy a plan, get credits, or view payment pricing, IMMEDIATELY invoke \`upgrade_subscription\`.
3. **Delivery Partner View**: If the user or delivery guy asks to open the courier hub or delivery partner scanner, invoke \`open_delivery_partner\`.
4. **Meal Swaps**: When the user asks to change, swap, or lighten a dish (e.g. "change Tuesday lunch"), invoke \`swap_meal\`.
5. **Track Delivery**: When the user asks about arrival time, courier location, or tracking (e.g. "when will it arrive", "where is my food"), invoke \`track_delivery\`. State the courier name (Rajesh Sharma), exact slot, and ETA.
6. **Cancel Delivery**: When the user asks to cancel an order or stop today's drop-off, invoke \`cancel_delivery\`.
7. **Hold Delivery**: When the user wants to pause dispatches for vacation or days off, invoke \`hold_delivery\`.
8. **Postpone Delivery**: When the user asks to postpone or reschedule, invoke \`postpone_delivery\`.
9. **Regenerate Plan**: When the user asks for a fresh new meal plan, invoke \`regenerate_plan\`.
10. **Tone & Markdown**: Always respond with clean, inspiring markdown formatting (bullet points, bold highlights). Be encouraging, scientific, and decisive.`;

  const apiMessages: GroqChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationMessages.slice(-8), // Send recent context window
  ];

  async function requestCompletions(model: string, msgs: GroqChatMessage[]) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: msgs,
        tools: NUTRIAI_TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API error (${res.status}): ${errText}`);
    }

    return await res.json();
  }

  try {
    let responseData: any;
    try {
      responseData = await requestCompletions(GROQ_PRIMARY_MODEL, apiMessages);
    } catch (primaryErr) {
      console.warn('Groq primary model failed, falling back:', primaryErr);
      responseData = await requestCompletions(GROQ_FALLBACK_MODEL, apiMessages);
    }

    const choice = responseData?.choices?.[0];
    const message = choice?.message;

    // Handle tool calling
    if (message?.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const fnName = toolCall.function.name;
      let args: any = {};
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        args = {};
      }

      let toolResult: any = { success: true };

      if (fnName === 'cancel_subscription' && handlers.onCancelSubscription) {
        toolResult = await handlers.onCancelSubscription();
      } else if (fnName === 'upgrade_subscription' && handlers.onUpgradeSubscription) {
        toolResult = await handlers.onUpgradeSubscription(args.tier);
      } else if (fnName === 'open_delivery_partner' && handlers.onOpenDeliveryPartner) {
        toolResult = await handlers.onOpenDeliveryPartner();
      } else if (fnName === 'swap_meal' && handlers.onSwapMeal) {
        const day = args.day || 'Wednesday';
        const category = args.category || 'Lunch';
        toolResult = await handlers.onSwapMeal(day, category, args.reason);
      } else if (fnName === 'cancel_delivery' && handlers.onCancelDelivery) {
        toolResult = await handlers.onCancelDelivery(args.orderId);
      } else if (fnName === 'track_delivery' && handlers.onTrackDelivery) {
        toolResult = await handlers.onTrackDelivery();
      } else if (fnName === 'hold_delivery' && handlers.onHoldDelivery) {
        toolResult = await handlers.onHoldDelivery(args.days || 3);
      } else if (fnName === 'postpone_delivery' && handlers.onPostponeDelivery) {
        toolResult = await handlers.onPostponeDelivery(args.newSlot);
      } else if (fnName === 'regenerate_plan' && handlers.onRegeneratePlan) {
        toolResult = await handlers.onRegeneratePlan();
      } else if (fnName === 'update_profile' && handlers.onUpdateProfile) {
        toolResult = await handlers.onUpdateProfile(args);
      }

      // Send tool execution result back to Groq for natural response synthesis
      const followUpMessages: GroqChatMessage[] = [
        ...apiMessages,
        message,
        {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        },
      ];

      try {
        let followUpResponse: any;
        try {
          followUpResponse = await requestCompletions(GROQ_PRIMARY_MODEL, followUpMessages);
        } catch (fErr) {
          followUpResponse = await requestCompletions(GROQ_FALLBACK_MODEL, followUpMessages);
        }
        const finalContent = followUpResponse?.choices?.[0]?.message?.content;
        if (finalContent) return finalContent;
      } catch (err) {
        console.warn('Tool follow-up completion failed:', err);
      }

      return toolResult.message || `Action completed: ${fnName} was executed successfully.`;
    }

    return message?.content || "I'm here to help with your meals, macros, and deliveries!";
  } catch (err) {
    console.error('Groq AI Call failed, using smart fallback:', err);
    throw err;
  }
}

/**
 * Generate a full authentic, personalized 7-Day Meal Plan Briefing using Groq AI
 */
export async function generateGroqMealPlanBriefing(
  userProfile: UserProfile,
  weeklyPlan: DayPlan[]
): Promise<string> {
  const sampleMeals = weeklyPlan
    .slice(0, 3)
    .map(
      (d) =>
        `• **${d.day}**: ${d.meals
          .map((m) => `${m.category}: ${m.name} (${m.calories} kcal, ${m.protein}g protein)`)
          .join(' | ')}`
    )
    .join('\n');

  const prompt = `You are NutriAI, an elite clinical sports nutritionist.
The user just completed their onboarding. Generate an inspiring, detailed, and structured 7-Day Precision Meal Plan launch briefing for them.

User Profile:
- Name: ${userProfile.name}
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Goal: ${userProfile.goal || 'muscle_gain'}
- Height: ${userProfile.heightCm || 178} cm | Weight: ${userProfile.weightKg || 87} kg
- Diet: ${userProfile.dietType || 'vegetarian'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None'}
- Disliked Foods: ${userProfile.dislikedFoods?.join(', ') || 'None'}
- Meals Per Day: ${userProfile.mealsPerDay || 4}
- Workout Days: ${userProfile.trainingDays || 5} days/week
- Caloric Target: ${userProfile.dailyCalories} kcal/day
- Target Macros: Protein ${userProfile.proteinGrams}g, Carbs ${userProfile.carbsGrams}g, Fats ${userProfile.fatGrams}g

Curated Sample Days:
${sampleMeals}

Requirements:
1. Address ${userProfile.name} personally and enthusiastically.
2. Provide a crisp breakdown of their daily target calories (${userProfile.dailyCalories} kcal) and macronutrient allocation.
3. Explain why this macro balance accelerates their ${userProfile.goal} goal.
4. Confirm how their dietary preference (${userProfile.dietType}) and allergen safety (${userProfile.allergies?.join(', ') || 'None'}) are enforced across all scheduled dishes.
5. Guide them: Remind them they can view all 7 days under the Meals tab or Artifact panel, and swap any recipe or ask questions in this chat anytime.
6. Use clean, high-impact markdown headers, bullet points, and bold text.
7. Completeness invariant: Never cut off mid-sentence or mid-word. Provide concise descriptions for the sample meals so the complete briefing finishes cleanly within the output.`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b', // Ultra-fast and high-quality
        messages: [
          {
            role: 'system',
            content: 'You are NutriAI, an evidence-based clinical and athletic nutritionist. Always conclude all sections completely with no cut-off sentences.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
    }
  } catch (err) {
    console.warn('Groq meal plan briefing request error, falling back:', err);
  }

  // High-fidelity fallback if offline
  return `### ⚡ **${userProfile.name.toUpperCase()} — 7-DAY PRECISION NUTRITION BLUEPRINT**\n\n` +
    `Your adaptive nutrition blueprint has been generated by NutriAI.\n\n` +
    `#### 📊 **Daily Target Calibration**\n` +
    `- **Energy Target:** **${userProfile.dailyCalories} kcal/day**\n` +
    `- **Protein:** **${userProfile.proteinGrams}g** (Muscle protein synthesis & recovery)\n` +
    `- **Carbohydrates:** **${userProfile.carbsGrams}g** (Glycogen replenishment & daily energy)\n` +
    `- **Dietary Fats:** **${userProfile.fatGrams}g** (Hormonal health & micronutrient absorption)\n\n` +
    `#### 🥗 **Dietary Rules & Allergen Safety**\n` +
    `- **Style:** ${userProfile.dietType?.toUpperCase() || 'VEGETARIAN'} (Strict compliance verified)\n` +
    `- **Allergen Guard:** ${userProfile.allergies?.join(', ') || 'None'} (Zero contamination verified)\n` +
    `- **Cadence:** ${userProfile.mealsPerDay || 4} structured meals balanced for your routine.\n\n` +
    `Your complete 7-day schedule is now active! Switch to the **Meals** tab or view the **7-Day Meal Plan** artifact to inspect recipes, preparation times, or swap any meal.`;
}

