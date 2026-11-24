import React, { useState, useRef, useEffect } from 'react';
import { useNutri } from '../../context/NutriContext';
import { ChatMessageItem } from './ChatMessageItem';
import { TypingIndicator } from './TypingIndicator';
import {
  MessageSquare,
  Search,
  SlidersHorizontal,
  SquarePen,
  MoreHorizontal,
  Plus,
  Send,
  RotateCcw,
  Pin,
  X,
  Layers,
  Sparkles,
  Bot,
} from 'lucide-react';

export const ChatWorkspace: React.FC = () => {
  const {
    messages,
    isTyping,
    sendMessage,
    chatThreads,
    activeThreadId,
    setActiveThreadId,
    createNewChat,
    resetOnboardingChat,
    setActiveTab,
    setActiveArtifact,
  } = useNutri();

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileChatsOpen, setMobileChatsOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setActionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleCreateChat = () => {
    createNewChat();
    setMobileChatsOpen(false);
  };

  const filteredThreads = chatThreads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedThreads = filteredThreads.filter((t) => t.isPinned);
  const regularThreads = filteredThreads.filter((t) => !t.isPinned);

  const activeThread =
    chatThreads.find((t) => t.id === activeThreadId) || chatThreads[0];

  const renderChatsList = () => (
    <div className="space-y-3.5 flex-1 min-h-0 flex flex-col">
      {/* Header Row: "Chats" + New Chat Icon */}
      <div className="flex items-center justify-between px-1">
        <h2 className="font-tight font-extrabold text-[20px] text-[#1F3A30] tracking-tight">
          Chats
        </h2>
        <button
          onClick={handleCreateChat}
          title="New Chat with Groq AI"
          className="w-8 h-8 rounded-xl bg-[#CAD7CF] hover:bg-[#BAC8BF] text-[#1F3A30] flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
        >
          <SquarePen className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>

      {/* Search Row: Search input + filter button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-9 rounded-xl bg-[#D7E2DB] px-3 flex items-center gap-2 border border-[#CAD7CF]/40 focus-within:border-[#1F3A30] transition-colors">
          <Search className="w-3.5 h-3.5 text-[#6B8074] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-transparent text-xs text-[#1F3A30] placeholder-[#6B8074] focus:outline-none font-medium"
          />
        </div>
        <button
          title="Filter"
          className="w-9 h-9 rounded-xl bg-[#D7E2DB] hover:bg-[#CAD7CF] text-[#1F3A30] flex items-center justify-center transition-colors shrink-0 shadow-2xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat Threads Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar pt-1">
        {/* 1. PINNED ONBOARDING THREAD */}
        {pinnedThreads.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10.5px] font-bold text-[#6B8074] uppercase tracking-wider flex items-center gap-1.5">
              <Pin className="w-3 h-3 text-[#1F3A30]" /> Pinned Setup
            </div>
            {pinnedThreads.map((thread) => {
              const isSelected = activeThreadId === thread.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setMobileChatsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#CAD7CF] text-[#1F3A30] shadow-2xs font-semibold'
                      : 'text-[#3B5446] hover:bg-[#D7E2DB]/80 hover:text-[#1F3A30]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sparkles
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-[#1F3A30]' : 'text-[#6B8074]'
                      }`}
                    />
                    <span className="font-tight text-xs truncate">
                      {thread.title}
                    </span>
                  </div>
                  <span className="font-mono text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-[#BAC8BF]/60 text-[#1F3A30] shrink-0 ml-2">
                    SETUP
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. REGULAR CONVERSATION THREADS (GROQ AI) */}
        <div className="space-y-1 pt-1">
          <div className="px-2 text-[10.5px] font-bold text-[#6B8074] uppercase tracking-wider flex items-center justify-between">
            <span>Conversations</span>
            <span className="text-[10px] text-emerald-800 font-mono">Groq Llama</span>
          </div>

          {regularThreads.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#6B8074] italic">
              No chat history. Start a new chat!
            </div>
          ) : (
            regularThreads.map((thread) => {
              const isSelected = activeThreadId === thread.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setMobileChatsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#CAD7CF] text-[#1F3A30] shadow-2xs font-semibold'
                      : 'text-[#486355] hover:bg-[#D7E2DB]/70 hover:text-[#1F3A30]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 stroke-[2] ${
                        isSelected ? 'text-[#1F3A30]' : 'text-[#6B8074]'
                      }`}
                    />
                    <span className="font-tight text-xs truncate">
                      {thread.title}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#6B8074] shrink-0 ml-2">
                    {thread.time}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex h-full w-full bg-[#E4ECE6] overflow-hidden select-none font-tight">
      {/* ============================================================== */}
      {/* MIDDLE COLUMN: "CHATS" SIDEBAR (MATCHING IMAGE 2)              */}
      {/* ============================================================== */}
      <div className="w-[260px] sm:w-[280px] shrink-0 border-r border-[#D5E1D8] bg-[#E4ECE6] flex flex-col justify-between h-full p-4 overflow-hidden hidden md:flex">
        {renderChatsList()}
      </div>

      {/* Mobile Drawer for Chats Sidebar */}
      {mobileChatsOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex">
          <div className="w-[280px] h-full bg-[#E4ECE6] p-4 flex flex-col shadow-modal animate-slide-right">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#D5E1D8]">
              <span className="font-bold text-xs uppercase tracking-wider text-[#587263]">Chat Threads</span>
              <button
                onClick={() => setMobileChatsOpen(false)}
                className="p-1 rounded-lg text-[#587263] hover:text-[#1F3A30]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderChatsList()}
          </div>
          <button
            onClick={() => setMobileChatsOpen(false)}
            className="flex-1 h-full cursor-default"
            aria-label="Close chats drawer"
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* RIGHT COLUMN: MAIN CHAT WORKSPACE                             */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col h-full bg-[#E4ECE6] min-w-0 overflow-hidden">
        {/* Workspace Sub-Header: Thread Title + Action Buttons */}
        <div className="h-14 border-b border-[#D5E1D8] px-4 sm:px-8 flex items-center justify-between shrink-0 bg-[#E4ECE6] relative">
          <div className="flex items-center gap-3">
            {/* Mobile Button to toggle Chats */}
            <button
              onClick={() => setMobileChatsOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#CAD7CF] text-xs font-semibold text-[#1F3A30] hover:bg-[#BAC8BF]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chats</span>
            </button>

            <h1 className="font-tight font-extrabold text-[17px] sm:text-[19px] text-[#1F3A30] tracking-tight truncate flex items-center gap-2">
              {activeThread.title}
              {activeThread.isOnboarding && (
                <span className="text-[10px] font-semibold text-[#587263] bg-[#D7E2DB] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Profile Setup
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* RESET DETAILS BUTTON (VISIBLE ONLY IN ONBOARDING CHAT) */}
            {activeThread.isOnboarding && (
              <button
                onClick={resetOnboardingChat}
                title="Reset details and restart onboarding"
                className="px-3 py-1.5 rounded-xl bg-[#CAD7CF] hover:bg-[#BAC8BF] text-[#1F3A30] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Details</span>
              </button>
            )}

            {/* More Actions Menu */}
            <div className="relative" ref={actionsRef}>
              <button
                onClick={() => setActionsMenuOpen((v) => !v)}
                title="More actions"
                className="w-8 h-8 rounded-full bg-[#CAD7CF] hover:bg-[#BAC8BF] text-[#1F3A30] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Actions Dropdown */}
              {actionsMenuOpen && (
                <div className="absolute right-0 top-10 w-56 rounded-2xl bg-[#F4F7F4] border border-[#CAD7CF] shadow-lg p-2 z-50 animate-fade-in text-xs">
                  <button
                    onClick={() => {
                      handleCreateChat();
                      setActionsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[#1F3A30] hover:bg-[#CAD7CF]/60 font-semibold cursor-pointer"
                  >
                    <SquarePen className="w-3.5 h-3.5" />
                    <span>New Groq Conversation</span>
                  </button>

                  {activeThread.isOnboarding && (
                    <button
                      onClick={() => {
                        resetOnboardingChat();
                        setActionsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[#1F3A30] hover:bg-[#CAD7CF]/60 font-semibold cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Onboarding Details</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('meals');
                      setActiveArtifact('weekly_meal_plan');
                      setActionsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[#1F3A30] hover:bg-[#CAD7CF]/60 font-semibold cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View 7-Day Meal Plan</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Thread Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-5 space-y-4">
          <div className="w-full max-w-4xl space-y-4">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Bottom Chat Input Bar (Capsule Style) */}
        <div className="p-4 sm:p-5 bg-[#E4ECE6] shrink-0 border-t border-[#D5E1D8]/60">
          <div className="w-full max-w-4xl">
            <form
              onSubmit={handleSubmit}
              className="h-14 bg-[#F3F7F4] border border-[#D5E1D8] rounded-2xl px-3.5 sm:px-4 flex items-center gap-3 shadow-xs"
            >
              {/* Plus Action Button */}
              <button
                type="button"
                onClick={() => {
                  setInputText('Swap my Tuesday lunch to something higher in protein');
                }}
                title="Quick suggested prompt"
                className="w-8 h-8 rounded-xl bg-[#E0EBE3] hover:bg-[#D0DDD3] text-[#1F3A30] flex items-center justify-center transition-colors font-bold text-base shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeThread.isOnboarding
                    ? 'State your preference or select an option above...'
                    : 'Ask Groq NutriAI or state a meal preference...'
                }
                className="flex-1 bg-transparent text-xs sm:text-sm text-[#1F3A30] placeholder-[#7A9184] focus:outline-none font-medium"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                title="Send message"
                className="w-9 h-9 rounded-xl bg-[#203D32] hover:bg-[#2B4E3F] text-white flex items-center justify-center transition-all shadow-xs shrink-0 disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
