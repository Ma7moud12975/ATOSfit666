import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Icon from '../../components/AppIcon';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ChatHistory from './components/ChatHistory';
import { saveConversationTurn, getConversationMessages, getConversations } from '../../utils/api/chatApi';
import { getAccountId } from '../../utils/localAccountStorage';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getChatbotApiKey,
  getChatbotModelName,
  isExplicitlyNonFitness,
  getNonFitnessRefusal,
  buildFitnessSystemInstruction,
  callGeminiWithFallback
} from '../../utils/aiConfig';
import '../../styles/bento-dashboard.css';

const ChatPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, message: t('chat.welcome'), isUser: false, timestamp: new Date() }]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [user, setUser] = useState({ name: 'Mahmoud Ayman', profilePicture: '' });
  const chatContainerRef = useRef(null);

  useEffect(() => {
    document.body.style.backgroundColor = 'var(--bento-bg)';
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.name) setUser(u);
    } catch { }
  }, []);

  const welcomeMessage = () => ({
    id: `welcome-${Date.now()}`,
    message: t('chat.welcome'),
    isUser: false,
    timestamp: new Date(),
  });

  const getUserId = () => getAccountId(user.principal || user.id || user.email || user.name);

  const getCurrentConversationKey = (userId) => `atos_ai_chat_current_conversation:${getAccountId(userId)}`;

  const formatConversationMessages = (items = []) => items.map(m => ({
    id: m.id,
    message: m.message,
    isUser: m.is_user_message,
    timestamp: new Date(m.timestamp),
  }));

  const loadConversationMessages = async (conversationId, title = null) => {
    if (!conversationId) return false;
    const userId = getUserId();
    const storedMessages = await getConversationMessages(userId, conversationId);
    if (!storedMessages?.length) return false;

    setMessages(formatConversationMessages(storedMessages));
    setCurrentConversationId(conversationId);
    setCurrentConversationTitle(title || storedMessages[0].conversation_title || storedMessages[0].message.substring(0, 30));
    localStorage.setItem(getCurrentConversationKey(userId), conversationId);
    return true;
  };

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const userId = getUserId();
        const requestedConversationId = searchParams.get('conversation');
        const lastConversationId = localStorage.getItem(getCurrentConversationKey(userId));
        const conversationId = requestedConversationId || lastConversationId;

        if (await loadConversationMessages(conversationId)) return;

        const [latestConversation] = await getConversations(userId, 1);
        if (latestConversation) {
          await loadConversationMessages(latestConversation.id, latestConversation.title);
        }
      } catch (error) { console.error('Error loading conversation:', error); }
    };
    loadConversation();
  }, [searchParams, user]);

  useEffect(() => {
    if (chatContainerRef?.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const CHATBOT_API_KEY = getChatbotApiKey();
  const CHATBOT_MODEL_NAME = getChatbotModelName();

  const handleSendMessage = async (message) => {
    const userMessage = { id: Date.now(), message, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // 1. Strict Deterministic Guard for out-of-domain queries
    if (isExplicitlyNonFitness(message)) {
      const refusalText = getNonFitnessRefusal(message);
      const aiMessage = { id: Date.now() + 1, message: refusalText, isUser: false, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      const userId = getUserId();
      if (userId) {
        saveConversationTurn(userId, message, refusalText, currentConversationId).catch(() => {});
      }
      return;
    }

    try {
      if (!CHATBOT_API_KEY) {
        throw new Error('Gemini API key is missing. Add a fresh VITE_CHATBOT_API_KEY to .env.');
      }

      let userProfile = null;
      try {
        const rawUser = localStorage.getItem('user');
        if (rawUser) userProfile = JSON.parse(rawUser);
      } catch {}

      const systemInstruction = buildFitnessSystemInstruction({ userProfile });

      const conversationTurns = messages
        .filter(item => item?.message && !String(item.id).startsWith('welcome-'))
        .slice(-10)
        .map(item => ({
          role: item.isUser ? 'user' : 'model',
          parts: [{ text: item.message }]
        }));

      conversationTurns.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const payload = {
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: conversationTurns,
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
      };

      const { data } = await callGeminiWithFallback(payload, CHATBOT_API_KEY, CHATBOT_MODEL_NAME);

      let aiText = t('chat.fallback');
      if (Array.isArray(data?.candidates) && data.candidates.length > 0) {
        const parts = data.candidates[0]?.content?.parts;
        if (Array.isArray(parts) && parts[0]?.text) {
          aiText = parts[0].text.trim();
        }
      }

      // Post-guard: catch any accidental non-fitness acknowledgements
      if (aiText.startsWith('نعم، أعرف') || aiText.startsWith('نعم، اعلم') || aiText.startsWith('Yes, I know') || aiText.toLowerCase().includes('رئيس أمريكي') || aiText.toLowerCase().includes('donald trump')) {
        aiText = getNonFitnessRefusal(message);
      }

      const aiMessage = { id: Date.now() + 1, message: aiText, isUser: false, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      const userId = getUserId();
      if (userId) {
        try {
          const result = await saveConversationTurn(userId, message, aiText, currentConversationId);
          if (!currentConversationId && result.conversationId) {
            setCurrentConversationId(result.conversationId);
            setCurrentConversationTitle(message.substring(0, 30));
          }
          localStorage.setItem(getCurrentConversationKey(userId), result.conversationId || currentConversationId);
          setHistoryVersion(version => version + 1);
        } catch (historyError) {
          console.warn('AI chat response received, but conversation history could not be saved:', historyError);
        }
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const isQuota = error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
      const fallbackMsg = isQuota
        ? (language === 'ar' ? 'الخدمة تشهد ضغطاً مؤقتاً، يرجى الانتظار بضع ثوانٍ والمحاولة ثانية.' : 'AI service is experiencing high temporary demand. Please wait a few seconds and retry.')
        : `Error: ${error.message}`;
      setMessages(prev => [...prev, { id: Date.now() + 1, message: fallbackMsg, isUser: false, timestamp: new Date() }]);
      setIsTyping(false);
    }
  };

  const handleConversationSelect = async (conversation) => {
    if (conversation) {
      try {
        await loadConversationMessages(conversation.id, conversation.title);
        setIsChatHistoryOpen(false);
      } catch (error) {
        console.warn('Selected conversation could not be loaded:', error);
      }
    } else {
      const userId = getUserId();
      setCurrentConversationId(null);
      setCurrentConversationTitle(null);
      setMessages([welcomeMessage()]);
      localStorage.removeItem(getCurrentConversationKey(userId));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login-screen');
  };

  return (
    <div className="bento-root">
      {/* Ambient Trails */}
      <div className="trail trail-coral" style={{ width: 600, height: 600, top: '-10%', right: '10%', opacity: 0.08 }} />
      <div className="trail trail-olive" style={{ width: 500, height: 500, bottom: '5%', left: '5%', opacity: 0.06 }} />

      <AppHeader
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />

      <SidebarNavigation isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-20 lg:pl-72 min-h-screen">
        <div className="px-3 py-3 md:px-6 md:py-4 max-w-[1500px] mx-auto flex flex-col h-[calc(100vh-100px)]">

          <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--bento-text)', margin: 0, letterSpacing: '0' }}>{t('chat.title')}</h1>
              <p style={{ color: 'var(--bento-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>{t('chat.subtitle')}</p>
            </div>
            <button
              onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}
              className="btn-olive"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              <Icon name="History" size={16} /> {isChatHistoryOpen ? t('common.messages') : t('chat.history')}
            </button>
          </div>

          <div className={`flex-1 grid gap-4 min-h-0 transition-all duration-300 ${isChatHistoryOpen ? 'grid-cols-1 lg:grid-cols-[300px_1fr]' : 'grid-cols-1'}`}>

            {/* History Sidebar */}
            <div className={`bento-card flex-col h-full overflow-hidden transition-all duration-300 ${isChatHistoryOpen ? 'flex lg:max-w-[320px] w-full' : 'hidden'}`}>
              <ChatHistory
                isOpen={true}
                onClose={() => setIsChatHistoryOpen(false)}
                onConversationSelect={handleConversationSelect}
                currentConversationId={currentConversationId}
                refreshKey={historyVersion}
              />
            </div>

            {/* Main Chat Area */}
            <div className={`bento-card flex-col h-full overflow-hidden ${isChatHistoryOpen ? 'hidden lg:flex' : 'flex'}`}>

              {/* Chat Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--bento-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bento-chip)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(250, 168, 2, 0.12)', border: '1px solid rgba(250, 168, 2, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(250, 168, 2, 0.15)' }}>
                    <Icon name="Bot" size={20} color="#FAA802" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--bento-text)', margin: 0 }}>{t('chat.coach')}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--bento-muted)', fontWeight: 600 }}>{t('chat.ready')}</span>
                    </div>
                  </div>
                </div>
                {currentConversationTitle && (
                  <div style={{ textAlign: 'right', display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--bento-soft-text)', fontWeight: 700, margin: 0, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentConversationTitle}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--bento-muted)' }}>{messages.length} {t('common.messages')}</p>
                  </div>
                )}
              </div>

              {/* Chat Messages */}
              <div ref={chatContainerRef} style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages?.map((m) => (
                  <ChatMessage key={m?.id} message={m?.message} isUser={m?.isUser} timestamp={m?.timestamp} />
                ))}
                {isTyping && <ChatMessage message="" isUser={false} timestamp={new Date()} isTyping={true} />}
              </div>

              {/* Chat Input */}
              <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
