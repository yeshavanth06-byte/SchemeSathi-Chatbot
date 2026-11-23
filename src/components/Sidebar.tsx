import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  UserCheck, 
  Phone, 
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ChatSession, UserCriteria } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearAllSessions: () => void;
  userCriteria: UserCriteria;
  onResetCriteria: () => void;
  onStartEligibilityCheck: () => void;
  onOpenHelplines: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onClearAllSessions,
  userCriteria,
  onResetCriteria,
  onStartEligibilityCheck,
  onOpenHelplines
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const hasProfile = Boolean(
    userCriteria.state || 
    userCriteria.age || 
    userCriteria.occupation || 
    userCriteria.annualIncome
  );

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = session.title.toLowerCase().includes(q);
    const messageMatch = session.messages.some(m => m.text.toLowerCase().includes(q));
    return titleMatch || messageMatch;
  });

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-72 sm:w-80 bg-white border-r border-slate-200
        flex flex-col transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:static lg:h-[calc(100vh-3.5rem)]
      `}>
        {/* Top: New Chat & Close (Mobile) */}
        <div className="p-3.5 border-b border-slate-100 flex items-center gap-2">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Conversations */}
        <div className="px-3.5 py-2 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Conversations ({filteredSessions.length})
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              {searchQuery ? 'No conversations matching search' : 'No previous conversations yet'}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = session.id === editingId;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`
                    group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all
                    ${isActive 
                      ? 'bg-orange-50/80 text-orange-950 font-semibold border border-orange-200' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`} />

                    {isEditing ? (
                      <div className="flex items-center gap-1 flex-1 mr-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(session.id, e);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full px-1.5 py-0.5 text-xs bg-white border border-orange-300 rounded focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={(e) => handleSaveRename(session.id, e)}
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1 text-slate-400 hover:text-slate-600"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="truncate flex-1">{session.title}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleStartRename(session, e)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-white"
                        title="Rename conversation"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => onDeleteSession(session.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-white"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Citizen Profile Summary Box */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <UserCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Citizen Profile</span>
            </div>
            {hasProfile && (
              <button
                onClick={onResetCriteria}
                className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-0.5 transition-colors"
                title="Reset saved eligibility profile"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {hasProfile ? (
            <div className="space-y-1 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
              {userCriteria.state && (
                <div className="flex justify-between">
                  <span className="text-slate-400">State:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">{userCriteria.state}</span>
                </div>
              )}
              {userCriteria.age && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Age:</span>
                  <span className="font-semibold text-slate-800">{userCriteria.age} Years</span>
                </div>
              )}
              {userCriteria.occupation && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Occupation:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">{userCriteria.occupation.split('/')[0]}</span>
                </div>
              )}
              {userCriteria.annualIncome !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Income:</span>
                  <span className="font-semibold text-slate-800">₹{userCriteria.annualIncome.toLocaleString('en-IN')}/yr</span>
                </div>
              )}
              <button
                onClick={() => {
                  onStartEligibilityCheck();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full mt-1.5 py-1 text-center text-[10px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded border border-orange-200 transition-colors flex items-center justify-center gap-1"
              >
                <span>Re-Check Eligibility</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200 text-center">
              <p className="mb-1.5">No eligibility profile saved yet.</p>
              <button
                onClick={() => {
                  onStartEligibilityCheck();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full py-1 text-center text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded shadow-xs transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Check Eligibility</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Actions: Helplines & Clear */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={() => {
              onOpenHelplines();
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex items-center gap-1.5 hover:text-rose-700 transition-colors font-medium"
          >
            <Phone className="w-3.5 h-3.5 text-rose-600" />
            <span>Emergency Helplines</span>
          </button>

          {sessions.length > 0 && (
            <button
              onClick={onClearAllSessions}
              className="hover:text-rose-600 transition-colors"
              title="Clear all chat history"
            >
              Clear All
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
