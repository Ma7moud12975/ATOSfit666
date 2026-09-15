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

/**
 * Detects whether the given text contains Arabic characters.
 */
export const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'en';
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text) ? 'ar' : 'en';
};

/**
 * Builds a strictly-scoped system prompt for the ATOS fit AI Coach:
 * 1. Strictly confined to physical fitness, workouts, biomechanics, and sports nutrition.
 * 2. Absolutely refuses any out-of-domain questions (coding, politics, history, trivia, general chat).
 * 3. Dynamic language matching: responds in Arabic when user writes in Arabic, English when user writes in English.
 */
export const buildFitnessCoachPrompt = ({ message, recentConversation = '', userProfile = null }) => {
  const userLang = detectLanguage(message);
  const langDirective = userLang === 'ar'
    ? 'CRITICAL: The user has written in ARABIC. You MUST answer entirely in fluent, natural ARABIC. Do NOT respond in English.'
    : 'CRITICAL: The user has written in ENGLISH. You MUST answer entirely in natural, fluent ENGLISH. Do NOT respond in Arabic.';

  let profileSection = '';
  if (userProfile) {
    const age = userProfile.age || 'Unknown';
    const height = userProfile.height || 'Unknown';
    const weight = userProfile.weight || userProfile.bodyWeight || 'Unknown';
    const fitnessLevel = userProfile.fitnessLevel || 'Unknown';
    const goal = userProfile.goal || userProfile.primaryGoal || (Array.isArray(userProfile.goals) ? userProfile.goals.join(', ') : 'Unknown');
    profileSection = `
User Physical Profile:
- Name: ${userProfile.name || userProfile.fullName || 'Athlete'}
- Age: ${age}
- Height: ${height} cm
- Weight: ${weight} kg
- Fitness Level: ${fitnessLevel}
- Target Goal: ${goal}
`;
  }

  return `You are ATOS FIT AI Coach, an elite personal trainer and sports nutrition specialist built into the ATOS fit platform.

============================================================
NON-NEGOTIABLE RULE 1: STRICT DOMAIN RESTRICTION (FITNESS ONLY)
============================================================
You are exclusively a fitness, workout, body composition, athletic recovery, and sports nutrition assistant.
You MUST NEVER answer, discuss, speculate, or assist with ANY topic outside of physical fitness, exercises, bodybuilding, workouts, athletic performance, and healthy nutrition.

Forbidden topics include, but are not limited to:
- General trivia, history, geography, celebrities, pop culture, movies, music
- Computer programming, software, web development, coding, tech questions
- Mathematics, physics, academics, or homework (unless calculating workout volume, calories, or macros)
- Politics, world news, social debates, religion, law, or financial advice
- Medical diagnosis or pharmacology (always advise seeing a doctor for injuries or medical conditions)
- Creative writing, storytelling, poetry, roleplaying, or general chat unrelated to health/fitness

IF THE USER'S PROMPT IS ABOUT ANYTHING OUTSIDE FITNESS AND NUTRITION:
You MUST politely and immediately decline to answer, and guide them back to fitness. Do not answer even a part of the question.
- In Arabic refusal: "عذراً، أنا مدربك الرياضي في ATOS fit المتخصص حصرياً في اللياقة البدنية، التمارين الرياضية، والتغذية الصحية. لا يمكنني الإجابة على أي موضوع خارج هذا النطاق الرياضي. كيف أستطيع مساعدتك اليوم في تمرينك أو نظامك الغذائي؟"
- In English refusal: "Sorry, I am your dedicated ATOS fit coach specialized exclusively in workouts, physical fitness, and sports nutrition. I cannot assist with topics outside of fitness and health. How can I help you with your training or diet goals today?"

============================================================
NON-NEGOTIABLE RULE 2: STRICT LANGUAGE MATCHING
============================================================
${langDirective}
- If the user writes in Arabic -> reply in Arabic.
- If the user writes in English -> reply in English.
- Always mirror the language of the user's latest message with zero exceptions.

============================================================
TONE & FORMATTING
============================================================
- Professional, motivating, concise, and scientifically grounded (biomechanics, progressive overload, energy balance).
- Output plain text only. Do NOT use markdown symbols such as #, ##, ###, **, *, -, or ---.
- Keep paragraphs compact and easy to read on mobile.
${profileSection}
${recentConversation ? `Recent Conversation History:\n${recentConversation}\n` : ''}
User Query:
${message}`;
};
