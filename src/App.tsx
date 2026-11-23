import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { SchemeModal } from './components/SchemeModal';
import { HelplineDrawer } from './components/HelplineDrawer';
import { storageService } from './services/storageService';
import { processUserQuery } from './services/nlpEngine';
import { ChatSession, ChatMessage, Scheme, UserCriteria } from './types';

export const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);
  const [userCriteria, setUserCriteria] = useState<UserCriteria>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load sessions and profile on startup
  useEffect(() => {
    let storedSessions = storageService.getSessions();
    const activeId = storageService.getActiveSessionId();
    const storedProfile = storageService.getUserProfile();

    setUserCriteria(storedProfile);

    if (storedSessions.length === 0) {
      const initialSession = storageService.createNewSession();
      storedSessions = [initialSession];
      setActiveSessionId(initialSession.id);
    } else {
      if (activeId && storedSessions.some(s => s.id === activeId)) {
        setActiveSessionId(activeId);
      } else {
        setActiveSessionId(storedSessions[0].id);
        storageService.setActiveSessionId(storedSessions[0].id);
      }
    }

    setSessions(storedSessions);
  }, []);

  // Get active session object
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Handle sending a user message
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !activeSession) return;

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    const updatedMessages = [...activeSession.messages, userMessage];
    const currentStep = activeSession.currentEligibilityStep || 0;
    const currentProfile = activeSession.userCriteria || userCriteria;

    // Determine auto-generated title if it's currently default
    let newTitle: string | undefined;
    if (activeSession.title === 'New Conversation') {
      newTitle = text.trim().slice(0, 36) + (text.length > 36 ? '...' : '');
    }

    // Immediately show user message
    storageService.updateSessionMessages(activeSession.id, updatedMessages, newTitle);
    setSessions(storageService.getSessions());
    setIsLoading(true);

    // Simulate natural AI thinking delay (300-500ms)
    setTimeout(() => {
      try {
        const response = processUserQuery(
          text, 
          currentProfile, 
          currentStep
        );

        const assistantMessage: ChatMessage = {
          id: 'asst_' + Date.now(),
          sender: 'assistant',
          text: response.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: response.type,
          matchedSchemes: response.matchedSchemes,
          selectedScheme: response.selectedScheme,
          quickReplies: response.quickReplies,
          matchReasons: response.matchReasons
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        const nextStep = response.nextEligibilityStep !== undefined ? response.nextEligibilityStep : currentStep;
        const nextCriteria = response.updatedCriteria ? { ...currentProfile, ...response.updatedCriteria } : currentProfile;

        if (response.updatedCriteria) {
          setUserCriteria(nextCriteria);
          storageService.saveUserProfile(nextCriteria);
        }

        storageService.updateSessionMessages(
          activeSession.id,
          finalMessages,
          newTitle,
          nextStep,
          nextCriteria
        );

        setSessions(storageService.getSessions());
      } catch (err) {
        console.error('Error processing query:', err);
        const errorMessage: ChatMessage = {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: 'I apologize, but I encountered an unexpected error processing your request. Please try asking again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        };
        const finalMessages = [...updatedMessages, errorMessage];
        storageService.updateSessionMessages(activeSession.id, finalMessages);
        setSessions(storageService.getSessions());
      } finally {
        setIsLoading(false);
      }
    }, 350);
  }, [activeSession, userCriteria]);

  // Start new chat
  const handleNewChat = useCallback(() => {
    const newSession = storageService.createNewSession();
    setSessions(storageService.getSessions());
    setActiveSessionId(newSession.id);
  }, []);

  // Select existing session
  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    storageService.setActiveSessionId(id);
    const session = sessions.find(s => s.id === id);
    if (session?.userCriteria) {
      setUserCriteria(session.userCriteria);
    }
  }, [sessions]);

  // Delete session
  const handleDeleteSession = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storageService.deleteSession(id);
    setSessions(updated);
    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
        storageService.setActiveSessionId(updated[0].id);
      } else {
        const fresh = storageService.createNewSession();
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
      }
    }
  }, [activeSessionId]);

  // Rename session
  const handleRenameSession = useCallback((id: string, newTitle: string) => {
    storageService.renameSession(id, newTitle);
    setSessions(storageService.getSessions());
  }, []);

  // Clear all sessions
  const handleClearAllSessions = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all conversation history?')) {
      storageService.clearAllSessions();
      const fresh = storageService.createNewSession();
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    }
  }, []);

  // Export conversation transcript
  const handleExportChat = useCallback(() => {
    if (!activeSession) return;
    const transcript = storageService.exportSessionText(activeSession);
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchemeSathi_${activeSession.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeSession]);

  // Reset eligibility criteria
  const handleResetCriteria = useCallback(() => {
    const empty: UserCriteria = {};
    setUserCriteria(empty);
    storageService.saveUserProfile(empty);
    if (activeSession) {
      storageService.updateSessionMessages(activeSession.id, activeSession.messages, undefined, 0, empty);
      setSessions(storageService.getSessions());
    }
  }, [activeSession]);

  // Trigger step-by-step eligibility flow directly into chat
  const handleStartEligibilityCheck = useCallback(() => {
    handleSendMessage('Check my eligibility for government schemes');
  }, [handleSendMessage]);

  // Ask scheme specific question in chat
  const handleAskAboutScheme = useCallback((scheme: Scheme, questionType?: string) => {
    if (questionType === 'troubleshooting') {
      handleSendMessage(`What are common portal problems and fixes for ${scheme.shortName}?`);
    } else {
      handleSendMessage(`Can you explain the benefits and application steps for ${scheme.name} (${scheme.shortName})?`);
    }
  }, [handleSendMessage]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 antialiased overflow-hidden">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onNewChat={handleNewChat}
        onExportChat={handleExportChat}
        onOpenHelplines={() => setIsHelplineOpen(true)}
        activeChatTitle={activeSession?.title}
        userCriteria={userCriteria}
      />

      {/* Main Body: Sidebar + Chat Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onClearAllSessions={handleClearAllSessions}
          userCriteria={userCriteria}
          onResetCriteria={handleResetCriteria}
          onStartEligibilityCheck={handleStartEligibilityCheck}
          onOpenHelplines={() => setIsHelplineOpen(true)}
        />

        {/* Central Chat Interface */}
        <main className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
          {activeSession && (
            <ChatArea
              messages={activeSession.messages}
              onQuickReply={handleSendMessage}
              onOpenSchemeDetail={(scheme) => setSelectedScheme(scheme)}
              isLoading={isLoading}
            />
          )}

          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </main>
      </div>

      {/* Slide-Over Scheme Details Modal */}
      <SchemeModal
        scheme={selectedScheme}
        onClose={() => setSelectedScheme(null)}
        onAskAboutScheme={handleAskAboutScheme}
      />

      {/* National Helplines Drawer */}
      <HelplineDrawer
        isOpen={isHelplineOpen}
        onClose={() => setIsHelplineOpen(false)}
      />
    </div>
  );
};
