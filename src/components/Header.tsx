import React from 'react';
import { 
  Menu, 
  Plus, 
  Download, 
  Phone, 
  Trash2,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { UserCriteria } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onExportChat: () => void;
  onOpenHelplines: () => void;
  activeChatTitle?: string;
  userCriteria: UserCriteria;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  onExportChat,
  onOpenHelplines,
  activeChatTitle,
  userCriteria
}) => {
  const hasProfile = Boolean(userCriteria.state || userCriteria.occupation || userCriteria.age);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Indian Tricolor Subtle Top Line */}
      <div className="h-[3px] w-full flex">
        <div className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500" />
        <div className="w-12 bg-white flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full border border-blue-800" />
        </div>
        <div className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left Section: Mobile Menu & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
            title="Toggle Navigation Sidebar"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* SchemeSathi Brand Identity */}
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => window.location.reload()}>
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-600 p-[1.5px] shadow-xs flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[6.5px] flex items-center justify-center">
                {/* Custom Saffron-Green Civic Monogram with Chakra dot */}
                <div className="relative flex items-center justify-center font-black text-sm tracking-tight">
                  <span className="text-orange-600">S</span>
                  <span className="text-emerald-700 -ml-0.5">S</span>
                  <span className="absolute -top-0.5 right-0 w-1 h-1 bg-blue-700 rounded-full" />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  Scheme<span className="text-orange-600">Sathi</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                  AI
                </span>
              </div>
              <span className="hidden sm:block text-[11px] text-slate-500 font-medium">
                National Government Welfare Assistant
              </span>
            </div>
          </div>
        </div>

        {/* Center: Active Conversation Title */}
        {activeChatTitle && (
          <div className="hidden md:flex items-center gap-2 max-w-sm truncate text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="truncate">{activeChatTitle}</span>
          </div>
        )}

        {/* Right Section: Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active Citizen Profile Pill */}
          {hasProfile && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold truncate max-w-[140px]">
                {userCriteria.state || 'All India'} • {userCriteria.occupation ? userCriteria.occupation.split('/')[0].trim() : 'Citizen'}
              </span>
            </div>
          )}

          {/* National Helplines Button */}
          <button
            onClick={onOpenHelplines}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            title="National Government Helpline Directory"
          >
            <Phone className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Helplines</span>
          </button>

          {/* Export Chat */}
          <button
            onClick={onExportChat}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Export Conversation Transcript"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-xs hover:shadow rounded-lg transition-all"
            title="Start New Conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
