import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import TabNavigation from './components/TabNavigation';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import FoodScannerCamera from './components/FoodScannerCamera';
import FoodAnalysisResult from './components/FoodAnalysisResult';
import ScanHistory from './components/ScanHistory';
import ChatHistory from './components/ChatHistory';
import { logFood, getFoodLogs, clearAllFoodLogs } from '../../utils/api/foodApi';
import { normalizeFoodAnalysis, parseFoodAnalysisResponse } from '../../utils/foodAnalysisNormalizer';
import { getNutritionStats, DASHBOARD_DATA_UPDATED } from '../../utils/dashboardStatsService';
import MealLoggedFeedbackModal from './components/MealLoggedFeedbackModal';
import {
  getChatbotApiKey,
  getChatbotModelName,
  isExplicitlyNonFitness,
  getNonFitnessRefusal,
  buildFitnessSystemInstruction,
  callGeminiWithFallback
} from '../../utils/aiConfig';

const AIAssistantFoodScanner = ({ chatOnly = false }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [justLoggedMeal, setJustLoggedMeal] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const chatContainerRef = useRef(null);

  // Initial welcome message
  const [messages, setMessages] = useState([{
    id: 1,
    message: "Hello! I'm your AI fitness coach. I can help you with workout plans, nutrition advice, form corrections, and answer any fitness-related questions. How can I assist you today?",
    isUser: false,
    timestamp: new Date(Date.now())
  }]);

  // Generate a concise session title from the first user message
  const generateChatTitle = (input, opts = {}) => {
    try {
      const maxWords = Number(opts.maxWords) || 7;
      if (!input || typeof input !== 'string') return 'New conversation';

      // Normalize whitespace
      let text = input.trim().replace(/\s+/g, ' ');

      // Remove surrounding quotes and common punctuation noise
      text = text
        .replace(/[“”"‘’]/g, '')
        .replace(/[\(\)\[\]{}<>]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Drop leading greetings or filler phrases
      text = text.replace(
        /^(?:hello|hi|hey|good\s+morning|good\s+afternoon|good\s+evening|greetings|please|can\s+you|could\s+you|would\s+you|help\s+me|i\s+am|i\s+'?m|i\s+want|i\s+'?d\s+like|i\s+need|i\s+'?m\s+looking\s+for|looking\s+for)(?:\s+to|\s+for)?\s+/i,
        ''
      );

      // Cut at first sentence-ending punctuation for brevity
      const cutIdx = text.search(/[?!.;]/);
      if (cutIdx > 0) text = text.slice(0, cutIdx);

      // Tokenize and take first N words
      let words = (text.match(/[^\s]+/g) || []).slice(0, maxWords);
      if (words.length === 0) return 'New conversation';

      // Title-case with minor words kept lowercase (except first)
      const minor = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'to', 'of', 'in', 'on', 'at', 'by', 'with']);
      const titled = words.map((w, idx) => {
        const base = w.toLowerCase();
        if (minor.has(base) && idx !== 0) return base;
        return base.charAt(0).toUpperCase() + base.slice(1);
      }).join(' ');

      return titled.trim();
    } catch {
      return 'New conversation';
    }
  };

  const getUserId = () => {
    const profile = userProfile || {};
    return profile.principal || profile.id || profile.email || profile.name || 'default-user';
  };

  const formatFoodLog = (food) => ({
    id: food.id,
    name: food.food_name || food.name,
    calories: food.calories || 0,
    protein: food.protein || 0,
    carbohydrates: food.carbs ?? food.carbohydrates ?? 0,
    fat: food.fat ?? food.fats ?? 0,
    sugar: food.sugar || 0,
    servingSize: food.portion_size || food.serving_size || food.servingSize || '100g',
    scanType: food.scan_type || food.scanType || 'food',
    timestamp: food.date_logged ? new Date(food.date_logged) : new Date(food.timestamp || Date.now()),
    image: food.image_url || food.image || '',
    recommendation: food.recommendation || '',
  });

  const isUsableFoodLog = (food) => {
    const name = String(food?.food_name || food?.name || '').trim().toLowerCase();
    const calories = Number(food?.calories || 0);
    const protein = Number(food?.protein || 0);
    const carbs = Number(food?.carbs ?? food?.carbohydrates ?? 0);
    const fats = Number(food?.fat ?? food?.fats ?? 0);
    return !(name.includes('unknown food') && calories === 0 && protein === 0 && carbs === 0 && fats === 0);
  };

  // Load saved scan history for this account
  useEffect(() => {
    const loadSavedScans = async () => {
      try {
        const userId = getUserId();
        const foods = await getFoodLogs(userId, { limit: 50 });
        setScanHistory(foods.filter(isUsableFoodLog).map(formatFoodLog));
      } catch (error) {
        console.warn('Could not load saved food scans:', error);
      }
    };
    loadSavedScans();
  }, [userProfile]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef?.current) {
      chatContainerRef.current.scrollTop = chatContainerRef?.current?.scrollHeight;
    }
  }, [messages, isTyping]);

  // Load user profile from localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage?.getItem('user') : null;
      if (raw) {
        const u = JSON.parse(raw);
        setUserProfile(u || null);
      }
    } catch { }
  }, []);

  // Initialize chat sessions and load persisted messages
  useEffect(() => {
    try {
      const sessionsRaw = typeof window !== 'undefined' ? window.localStorage?.getItem('atos_chat_sessions') : null;
      const currentIdRaw = typeof window !== 'undefined' ? window.localStorage?.getItem('atos_current_chat_session_id') : null;
      const sessions = sessionsRaw ? JSON.parse(sessionsRaw) : [];
      setChatSessions(Array.isArray(sessions) ? sessions : []);

      let sessionId = currentIdRaw || null;
      if (!sessionId) {
        sessionId = String(Date.now());
        window.localStorage?.setItem('atos_current_chat_session_id', sessionId);
        const welcome = [{
          id: Date.now(),
          message: "Hello! I'm your AI fitness coach. I can help you with workout plans, nutrition advice, form corrections, and answer any fitness-related questions. How can I assist you today?",
          isUser: false,
          timestamp: new Date()
        }];
        window.localStorage?.setItem(`atos_chat_messages_${sessionId}`, JSON.stringify(welcome));
        const meta = {
          id: sessionId,
          startedAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
          messageCount: 1,
          title: null
        };
        const nextSessions = [meta, ...sessions];
        setChatSessions(nextSessions);
        window.localStorage?.setItem('atos_chat_sessions', JSON.stringify(nextSessions));
        setMessages(welcome);
        setChatSessionId(sessionId);
        return;
      }

      // Load persisted messages for current session
      const savedRaw = window.localStorage?.getItem(`atos_chat_messages_${sessionId}`);
      if (savedRaw) {
        try {
          const savedMessages = JSON.parse(savedRaw);
          if (Array.isArray(savedMessages) && savedMessages.length > 0) {
            setMessages(savedMessages);
          }
        } catch { }
      }
      setChatSessionId(sessionId);
    } catch { }
  }, []);

  // Persist messages on change and update session metadata
  useEffect(() => {
    if (!chatSessionId) return;
    try {
      window.localStorage?.setItem(`atos_chat_messages_${chatSessionId}`, JSON.stringify(messages));
      // Update sessions meta
      setChatSessions(prev => {
        const updated = Array.isArray(prev) ? prev.map(s => (
          s.id === chatSessionId
            ? { ...s, lastMessageAt: new Date().toISOString(), messageCount: messages?.length || 0 }
            : s
        )) : [];
        window.localStorage?.setItem('atos_chat_sessions', JSON.stringify(updated));
        return updated;
      });
    } catch { }
  }, [messages, chatSessionId]);

  const CHATBOT_API_KEY = getChatbotApiKey();
  const CHATBOT_MODEL_NAME = getChatbotModelName();
  const handleSendMessage = async (message) => {
    const userMessage = {
      id: Date.now(),
      message,
      isUser: true,
      timestamp: new Date()
    };
    // Determine if this is the first user message in the current session
    const isFirstUserMessage = !(Array.isArray(messages) ? messages.some(m => m?.isUser) : false);

    // Add user message
    setMessages(prev => [...prev, userMessage]);

    // If first user message, generate and persist a session title
    if (isFirstUserMessage && chatSessionId) {
      const title = generateChatTitle(message, { maxWords: 7 });
      setChatSessions(prev => {
        const updated = Array.isArray(prev) ? prev.map(s => (
          s.id === chatSessionId ? { ...s, title } : s
        )) : [];
        try {
          window.localStorage?.setItem('atos_chat_sessions', JSON.stringify(updated));
        } catch { }
        return updated;
      });
    }
    setIsTyping(true);

    // 1. Strict Deterministic Guard for out-of-domain queries
    if (isExplicitlyNonFitness(message)) {
      const refusalText = getNonFitnessRefusal(message);
      const aiMessage = {
        id: Date.now() + 1,
        message: refusalText,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      return;
    }

    try {
      if (!CHATBOT_API_KEY) {
        throw new Error('Gemini API key is missing. Add a fresh VITE_CHATBOT_API_KEY to .env.');
      }

      // Refresh latest user profile from localStorage on each send
      let currentUserProfile = userProfile;
      try {
        const rawNow = typeof window !== 'undefined' ? window.localStorage?.getItem('user') : null;
        if (rawNow) {
          currentUserProfile = JSON.parse(rawNow) || userProfile;
        }
      } catch { }

      const systemInstruction = buildFitnessSystemInstruction({ userProfile: currentUserProfile });

      const conversationTurns = (Array.isArray(messages) ? messages : [])
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

      let aiText = 'Sorry, no response from AI.';
      if (Array.isArray(data?.candidates) && data.candidates.length > 0) {
        const parts = data.candidates[0]?.content?.parts;
        if (Array.isArray(parts)) {
          const textParts = parts.filter(p => p.text).map(p => p.text);
          if (textParts.length > 0) {
            aiText = textParts.join('\n').trim() || aiText;
          }
        }
      }

      // Post-guard: catch any accidental non-fitness acknowledgements
      if (aiText.startsWith('نعم، أعرف') || aiText.startsWith('نعم، اعلم') || aiText.startsWith('Yes, I know') || aiText.toLowerCase().includes('رئيس أمريكي') || aiText.toLowerCase().includes('donald trump')) {
        aiText = getNonFitnessRefusal(message);
      }

      const aiMessage = {
        id: Date.now() + 1,
        message: aiText,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const isQuota = error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
      const fallbackMsg = isQuota
        ? 'الخدمة تشهد ضغطاً مؤقتاً، يرجى الانتظار بضع ثوانٍ والمحاولة ثانية.'
        : 'Error contacting AI service.';
      const aiMessage = {
        id: Date.now() + 1,
        message: fallbackMsg,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Create a new chat session
  const handleNewChat = () => {
    try {
      const newId = String(Date.now());
      window.localStorage?.setItem('atos_current_chat_session_id', newId);
      const welcome = [{
        id: Date.now(),
        message: "Hello! I'm your AI fitness coach. How can I assist you today?",
        isUser: false,
        timestamp: new Date()
      }];
      window.localStorage?.setItem(`atos_chat_messages_${newId}`, JSON.stringify(welcome));
      setMessages(welcome);
      setChatSessionId(newId);
      setChatSessions(prev => {
        const next = [
          {
            id: newId,
            startedAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            messageCount: 1,
            title: null
          },
          ...prev
        ];
        window.localStorage?.setItem('atos_chat_sessions', JSON.stringify(next));
        return next;
      });
    } catch { }
  };

  // Load a specific session
  const handleSelectSession = (id) => {
    try {
      const savedRaw = window.localStorage?.getItem(`atos_chat_messages_${id}`);
      const saved = savedRaw ? JSON.parse(savedRaw) : null;
      if (Array.isArray(saved)) {
        setMessages(saved);
        setChatSessionId(id);
        window.localStorage?.setItem('atos_current_chat_session_id', id);
      }
    } catch { }
  };

  // Delete a session
  const handleDeleteSession = (id) => {
    try {
      window.localStorage?.removeItem(`atos_chat_messages_${id}`);
      setChatSessions(prev => {
        const next = (prev || []).filter(s => s.id !== id);
        window.localStorage?.setItem('atos_chat_sessions', JSON.stringify(next));
        return next;
      });
      if (chatSessionId === id) {
        // Switch to newest available session or create a new one
        const sessionsRaw = window.localStorage?.getItem('atos_chat_sessions');
        const sessions = sessionsRaw ? JSON.parse(sessionsRaw) : [];
        if (Array.isArray(sessions) && sessions.length > 0) {
          const nextId = sessions[0].id;
          handleSelectSession(nextId);
        } else {
          handleNewChat();
        }
      }
    } catch { }
  };

  const handleFoodCapture = async (file, scanType) => {
    setIsScanning(true);
    try {
      // Convert image file to base64
      const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const imageBase64 = await toBase64(file);

      if (!CHATBOT_API_KEY) {
        throw new Error('Gemini API key is missing. Add a fresh VITE_CHATBOT_API_KEY to .env.');
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${CHATBOT_MODEL_NAME}:generateContent?key=${CHATBOT_API_KEY}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: file.type,
                    data: imageBase64
                  }
                },
                {
                  text:
                    `Analyze this food image and return one minified JSON object only. Do not use markdown, code fences, comments, or prose. Estimate nutrition for the visible serving. Required fields: {"name":string,"calories":number,"protein":number,"carbohydrates":number,"fat":number,"sugar":number,"serving_size":string,"recommendation":string,"allergens":string,"health_score":number}. Never omit protein, carbohydrates, fat, or sugar; if uncertain, provide the best visual estimate as numeric grams.`
                }
              ]
            }
          ],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024, responseMimeType: 'application/json' }
        })
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error.message || 'Food analysis API error.');
      }
      if (!response.ok) {
        throw new Error(`Food analysis API request failed with status ${response.status}.`);
      }
      let result = null;
      let rawText = '';
      if (Array.isArray(data?.candidates) && data.candidates.length > 0) {
        const parts = data.candidates[0]?.content?.parts;
        if (Array.isArray(parts)) {
          const textParts = parts.filter(p => p.text).map(p => p.text);
          if (textParts.length > 0) {
            rawText = textParts.join('\n');
            result = parseFoodAnalysisResponse(rawText);
          }
        }
      }
      if (result) {
        const normalizedResult = normalizeFoodAnalysis(result, {
          image: URL.createObjectURL(file),
          scanType,
          timestamp: new Date(),
        });
        setScanResult(normalizedResult);
      } else {
        throw new Error(rawText ? 'The AI response did not include usable nutrition JSON.' : 'No food prediction was returned from AI.');
      }
    } catch (error) {
      setScanResult({ name: 'Error', recommendation: error.message || 'Error contacting AI service.', image: URL.createObjectURL(file), scanType, timestamp: new Date(), errorMessage: error.message });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToHistory = async (result) => {
    try {
      const saved = await logFood(getUserId(), {
        foodName: result.name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbohydrates ?? result.carbs,
        fat: result.fat ?? result.fats,
        sugar: result.sugar,
        portionSize: result.serving_size || result.servingSize,
        imageUrl: result.image,
        scanType: result.scanType,
        recommendation: result.recommendation,
        dateLogged: result.timestamp ? new Date(result.timestamp).toISOString() : new Date().toISOString(),
      });
      const formatted = formatFoodLog(saved);
      setScanHistory(prev => [formatted, ...prev.filter(item => item.id !== saved.id)]);
      setScanResult(null);
      const currentU = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedStats = getNutritionStats(getUserId(), new Date(), currentU);
      setDailyStats(updatedStats);
      setJustLoggedMeal(formatted);
      setIsFeedbackModalOpen(true);
    } catch (error) {
      console.warn('Could not save food scan:', error);
    }
  };

  const handleNewScan = () => {
    setScanResult(null);
  };

  const handleReanalyze = (scan) => {
    setScanResult(scan);
  };

  const handleClearHistory = async () => {
    try {
      await clearAllFoodLogs(getUserId());
    } catch (error) {
      console.warn('Could not clear synced food history:', error);
    }
    setScanHistory([]);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    navigate('/login-screen');
  };

  const shouldShowSidebar = chatOnly ? showChatHistory : (activeTab === 'chat' ? showChatHistory : true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader
        onSidebarToggle={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onThemeToggle={toggleTheme}
        currentTheme={currentTheme}
        user={JSON.parse(localStorage.getItem('user')) || {}}
        onLogout={handleLogout}
      />
      {/* Sidebar */}
      <SidebarNavigation
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="pt-20 lg:pl-72 min-h-screen relative z-10">
        <div className="p-3 lg:p-5">


          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {chatOnly ? 'AI Chatbot' : 'AI Assistant & Food Scanner'}
            </h1>
            <p className="text-muted-foreground">
              {chatOnly ? 'Chat with your AI fitness assistant' : 'Get personalized fitness coaching and analyze your food nutrition with AI'}
            </p>
          </div>

          {/* Tab Navigation */}
          {!chatOnly && (
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="mb-4"
            />
          )}

          {/* Content Area */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className={shouldShowSidebar ? "xl:col-span-3" : "xl:col-span-4"}>
              {chatOnly ? (
                /* Chat Assistant (chat-only mode) */
                (<div className="bg-card border border-border rounded-xl h-[calc(100vh-190px)] min-h-[500px] flex flex-col">
                  {/* Chat Header */}
                  <div className="p-3 sm:p-4 border-b border-border">
                    <div className="flex items-center flex-wrap gap-3">
                      <div className="w-12 h-12 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center">
                        <Icon name="Bot" size={22} color="white" />
                      </div>
                      <div className="min-w-[140px]">
                        <h3 className="font-semibold text-card-foreground text-base sm:text-lg">ATOS fit</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-success rounded-full inline-block"></span>
                          <span>Online</span>
                        </p>
                      </div>
                      <div className="ml-auto w-full md:w-auto flex items-center gap-2 mt-2 md:mt-0">
                        <Button size="sm" variant="outline" onClick={() => setShowChatHistory(v => !v)} iconName="History" iconPosition="left" className="h-10 px-4 md:h-9 md:px-3">
                          {showChatHistory ? 'Hide History' : 'Show History'}
                        </Button>
                        <Button size="sm" onClick={handleNewChat} iconName="Plus" iconPosition="left" className="h-10 px-4 md:h-9 md:px-3">
                          New Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Chat Messages */}
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4"
                  >
                    {messages?.map((message) => (
                      <ChatMessage
                        key={message?.id}
                        message={message?.message}
                        isUser={message?.isUser}
                        timestamp={message?.timestamp}
                      />
                    ))}
                    {isTyping && <ChatMessage message="" isUser={false} timestamp={new Date()} isTyping={true} />}
                  </div>
                  {/* Chat Input */}
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={isTyping}
                  />
                </div>)
              ) : activeTab === 'chat' ? (
                /* Chat Assistant */
                (<div className="bg-card border border-border rounded-xl h-[calc(100vh-230px)] min-h-[500px] flex flex-col">
                  {/* Chat Header */}
                  <div className="p-3 sm:p-4 border-b border-border">
                    <div className="flex items-center flex-wrap gap-3">
                      <div className="w-12 h-12 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center">
                        <Icon name="Bot" size={22} color="white" />
                      </div>
                      <div className="min-w-[140px]">
                        <h3 className="font-semibold text-card-foreground text-base sm:text-lg">ATOS fit</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-success rounded-full inline-block"></span>
                          <span>Online</span>
                        </p>
                      </div>
                      <div className="ml-auto w-full md:w-auto flex items-center gap-2 mt-2 md:mt-0">
                        <Button size="sm" variant="outline" onClick={() => setShowChatHistory(v => !v)} iconName="History" iconPosition="left" className="h-10 px-4 md:h-9 md:px-3">
                          {showChatHistory ? 'Hide History' : 'Show History'}
                        </Button>
                        <Button size="sm" onClick={handleNewChat} iconName="Plus" iconPosition="left" className="h-10 px-4 md:h-9 md:px-3">
                          New Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Chat Messages */}
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4"
                  >
                    {messages?.map((message) => (
                      <ChatMessage
                        key={message?.id}
                        message={message?.message}
                        isUser={message?.isUser}
                        timestamp={message?.timestamp}
                      />
                    ))}
                    {isTyping && <ChatMessage message="" isUser={false} timestamp={new Date()} isTyping={true} />}
                  </div>
                  {/* Chat Input */}
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={isTyping}
                  />
                </div>)
              ) : (
                /* Food Scanner */
                (<div className="bg-card border border-border rounded-xl p-6">
                  {scanResult ? (
                    <FoodAnalysisResult
                      result={scanResult}
                      onSaveToHistory={handleSaveToHistory}
                      onNewScan={handleNewScan}
                    />
                  ) : (
                    <FoodScannerCamera
                      onCapture={handleFoodCapture}
                      onUpload={handleFoodCapture}
                      isScanning={isScanning}
                    />
                  )}
                </div>)
              )}
            </div>

            {/* Sidebar Content */}
            {shouldShowSidebar && (
              <div className="xl:col-span-1 space-y-6">
                {chatOnly ? (
                  showChatHistory ? (
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                      </div>
                      <ChatHistory
                        sessions={chatSessions}
                        currentSessionId={chatSessionId}
                        onSelectSession={handleSelectSession}
                        onDeleteSession={handleDeleteSession}
                      />
                    </div>
                  ) : null
                ) : activeTab === 'chat' ? (
                  showChatHistory ? (
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                      </div>
                      <ChatHistory
                        sessions={chatSessions}
                        currentSessionId={chatSessionId}
                        onSelectSession={handleSelectSession}
                        onDeleteSession={handleDeleteSession}
                      />
                    </div>
                  ) : null
                ) : (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <ScanHistory
                      history={scanHistory}
                      onReanalyze={handleReanalyze}
                      onClearHistory={handleClearHistory}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <MealLoggedFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        meal={justLoggedMeal}
        dailyStats={dailyStats}
        onNavigateDashboard={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default AIAssistantFoodScanner;
