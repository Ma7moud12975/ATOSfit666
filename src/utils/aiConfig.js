/**
 * ATOS fit AI & Gemini Configuration
 * Provides fallback API key and model name so AI Assistant and Food Scanner
 * work seamlessly both in local development and production deployments (Vercel).
 */

export const DEFAULT_CHATBOT_API_KEY = 'AQ.Ab8RN6K3qSM-0g7LcfL1ka7OE7rgqfSxMGZ8wiEKySoSxkBOlw';
export const DEFAULT_CHATBOT_MODEL = 'gemini-3.6-flash';

export const getChatbotApiKey = () => {
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHATBOT_API_KEY) || DEFAULT_CHATBOT_API_KEY;
};

export const getChatbotModelName = () => {
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHATBOT_MODEL_NAME) || DEFAULT_CHATBOT_MODEL;
};
