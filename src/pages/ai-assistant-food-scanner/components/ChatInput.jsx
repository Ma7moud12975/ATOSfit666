import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../contexts/LanguageContext';

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recordingStatus, setRecordingStatus] = useState('');
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const toggleVoiceRecording = () => {
    if (disabled) return;

    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      alert(language === 'ar'
        ? 'التعرف الصوتي غير مدعوم في متصفحك الحالي. يُرجى استخدام متصفح Google Chrome أو Microsoft Edge أو Safari.'
        : 'Voice input is not supported on this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    // If currently recording, stop it cleanly
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsRecording(false);
      setRecordingStatus('');
      return;
    }

    // Start fresh recognition instance on user click
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'ar' ? 'ar-EG' : 'en-US';

      // Keep snapshot of message before voice input starts
      const baseMessage = message;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingStatus(language === 'ar' ? 'جارٍ الاستماع... تحدث الآن 🎙️' : 'Listening... Speak now 🎙️');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item && item[0]) {
            if (item.isFinal) {
              finalTranscript += item[0].transcript;
            } else {
              interimTranscript += item[0].transcript;
            }
          }
        }
        const spoken = (finalTranscript || interimTranscript).trim();
        if (spoken) {
          const prefix = baseMessage.trim();
          setMessage(prefix ? `${prefix} ${spoken}` : spoken);
        }
        if (textareaRef?.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event?.error);
        setIsRecording(false);
        setRecordingStatus('');
        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          alert(language === 'ar'
            ? 'تم حظر الميكروفون. يُرجى السماح للمتصفح بالوصول للميكروفون من إعدادات الموقع لتفعيل الإملاء الصوتي.'
            : 'Microphone access denied. Please allow microphone permissions in your browser.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setRecordingStatus('');
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Could not start microphone:', err);
      setIsRecording(false);
      setRecordingStatus('');
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message?.trim() && !disabled) {
      if (isRecording && recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        setIsRecording(false);
      }
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef?.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    if (textareaRef?.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const quickPrompts = [
    t('chat.promptBeginner'),
    t('chat.promptMeal'),
    t('chat.promptPrep'),
    t('chat.promptForm')
  ];

  return (
    <div className="chat-input-container">
      {/* Recording Status Banner */}
      {isRecording && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          marginBottom: '8px',
          background: 'rgba(250, 168, 2, 0.15)',
          border: '1px solid rgba(250, 168, 2, 0.4)',
          borderRadius: '999px',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#FAA802',
          width: 'fit-content',
          animation: 'pulse 1.5s infinite ease-in-out'
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FAA802', display: 'inline-block' }} />
          <span>{recordingStatus}</span>
        </div>
      )}

      {/* Quick Prompts */}
      <div className="chat-input-prompts">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => !disabled && onSendMessage(prompt)}
            disabled={disabled}
            className="chat-input-prompt-btn"
            style={{
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            placeholder={isRecording ? (language === 'ar' ? 'جارٍ تحويل صوتك لنص...' : 'Transcribing voice...') : t('chat.input')}
            disabled={disabled}
            rows={1}
            className="chat-input-textarea"
            style={{
              opacity: disabled ? 0.6 : 1,
              borderColor: isRecording ? '#FAA802' : undefined,
              boxShadow: isRecording ? '0 0 12px rgba(250, 168, 2, 0.35)' : undefined
            }}
          />
          <button
            type="button"
            onClick={toggleVoiceRecording}
            disabled={disabled}
            className="chat-input-mic-btn"
            title={isRecording ? (language === 'ar' ? 'إيقاف التسجيل الصوتي' : 'Stop recording') : (language === 'ar' ? 'تسجيل رسالة صوتية' : 'Voice input')}
            style={{
              color: isRecording ? '#FAA802' : undefined,
              background: isRecording ? 'rgba(250, 168, 2, 0.2)' : undefined,
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              transform: isRecording ? 'translateY(-50%) scale(1.12)' : 'translateY(-50%)',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            <Icon name="Mic" size={19} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="btn-coral chat-input-send-btn"
          style={{ 
            opacity: (!message.trim() || disabled) ? 0.5 : 1,
            cursor: (!message.trim() || disabled) ? 'not-allowed' : 'pointer'
          }}
        >
          <Icon name="Send" size={20} color="#FFFFFF" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
