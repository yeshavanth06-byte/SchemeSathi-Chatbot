import { ChatMessage, ChatSession, UserCriteria } from '../types';

const STORAGE_KEY_SESSIONS = 'schemesathi_sessions_v2';
const STORAGE_KEY_ACTIVE_ID = 'schemesathi_active_session_id_v2';
const STORAGE_KEY_USER_PROFILE = 'schemesathi_user_profile_v2';

export const storageService = {
  getSessions(): ChatSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load chat sessions:', e);
      return [];
    }
  },

  saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save chat sessions:', e);
    }
  },

  getActiveSessionId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    } catch {
      return null;
    }
  },

  setActiveSessionId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    } catch (e) {
      console.error('Failed to set active session ID:', e);
    }
  },

  getUserProfile(): UserCriteria {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveUserProfile(profile: UserCriteria): void {
    try {
      localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save user profile:', e);
    }
  },

  createNewSession(title: string = 'New Conversation'): ChatSession {
    const newSession: ChatSession = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'welcome_' + Date.now(),
          sender: 'assistant',
          text: `Namaste! 🙏 Welcome to **SchemeSathi** — your trusted AI companion for Indian Government Welfare Schemes.\n\nI can help you discover Central and State government schemes you qualify for, provide required document checklists, guide your official application, and troubleshoot common portal errors.\n\nHow can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          quickReplies: [
            '🔍 Check My Eligibility',
            '🌾 Schemes for Farmers',
            '🎓 Scholarships for Students',
            '👩 Women & Mother Schemes',
            '💼 Small Business & MSME Loans',
            '🏥 Ayushman Health Card',
            '⚡ PM Surya Ghar Solar Subsidy',
            '🛠️ Troubleshoot Portal Errors'
          ]
        }
      ],
      userCriteria: storageService.getUserProfile(),
      currentEligibilityStep: 0
    };

    const sessions = storageService.getSessions();
    sessions.unshift(newSession);
    storageService.saveSessions(sessions);
    storageService.setActiveSessionId(newSession.id);
    return newSession;
  },

  deleteSession(id: string): ChatSession[] {
    const sessions = storageService.getSessions().filter(s => s.id !== id);
    storageService.saveSessions(sessions);
    return sessions;
  },

  renameSession(id: string, newTitle: string): void {
    const sessions = storageService.getSessions();
    const session = sessions.find(s => s.id === id);
    if (session && newTitle.trim()) {
      session.title = newTitle.trim();
      session.updatedAt = new Date().toISOString();
      storageService.saveSessions(sessions);
    }
  },

  updateSessionMessages(
    sessionId: string, 
    messages: ChatMessage[], 
    newTitle?: string,
    eligibilityStep?: number,
    criteria?: UserCriteria
  ): void {
    const sessions = storageService.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.messages = messages;
      session.updatedAt = new Date().toISOString();
      if (newTitle && session.title === 'New Conversation') {
        session.title = newTitle;
      }
      if (eligibilityStep !== undefined) {
        session.currentEligibilityStep = eligibilityStep;
      }
      if (criteria) {
        session.userCriteria = { ...(session.userCriteria || {}), ...criteria };
        storageService.saveUserProfile(session.userCriteria);
      }
      storageService.saveSessions(sessions);
    }
  },

  clearAllSessions(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_SESSIONS);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    } catch (e) {
      console.error('Failed to clear sessions:', e);
    }
  },

  exportSessionText(session: ChatSession): string {
    return session.messages.map(m => {
      const sender = m.sender === 'user' ? 'Citizen' : 'SchemeSathi AI';
      return `[${m.timestamp}] ${sender}:\n${m.text}\n`;
    }).join('\n' + '='.repeat(40) + '\n\n');
  }
};
