/**
 * ATOS fit AI & Gemini Configuration & Strict Guard System
 * Ensures the AI Coach NEVER leaves the fitness & nutrition domain,
 * provides zero-hallucination refusals, mirrors user language,
 * and seamlessly handles model failover across high-availability Gemini models.
 */

export const DEFAULT_CHATBOT_API_KEY = 'AQ.Ab8RN6K3qSM-0g7LcfL1ka7OE7rgqfSxMGZ8wiEKySoSxkBOlw';
export const DEFAULT_CHATBOT_MODEL = 'gemini-flash-lite-latest';

// Resilient pool of active models to automatically failover if one hits rate limits (429) or high demand (503)
// Prioritized by response latency: sub-second lite models first, falling back to standard models
export const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3-flash-preview'
];

export const NON_FITNESS_REFUSAL_AR = 'عذراً، أنا مدربك الرياضي في ATOS fit المتخصص حصرياً في اللياقة البدنية، التمارين الرياضية، والتغذية الصحية. لا يمكنني الإجابة على أي موضوع خارج هذا النطاق الرياضي. كيف يمكنني مساعدتك اليوم في تمرينك أو نظامك الغذائي؟';

export const NON_FITNESS_REFUSAL_EN = 'Sorry, I am your dedicated ATOS fit coach specialized exclusively in workouts, physical fitness, and sports nutrition. I cannot assist with topics outside of fitness and health. How can I help you with your training or diet goals today?';

export const getChatbotApiKey = () => {
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHATBOT_API_KEY) || DEFAULT_CHATBOT_API_KEY;
};

export const getChatbotModelName = () => {
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHATBOT_MODEL_NAME) || DEFAULT_CHATBOT_MODEL;
};

/**
 * Detects whether the text is predominantly Arabic.
 */
export const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'en';
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text) ? 'ar' : 'en';
};

/**
 * Returns the localized refusal message matching user query language.
 */
export const getNonFitnessRefusal = (text) => {
  return detectLanguage(text) === 'ar' ? NON_FITNESS_REFUSAL_AR : NON_FITNESS_REFUSAL_EN;
};

/**
 * Deterministic pre-filter: catches queries that are unmistakably outside
 * the fitness & nutrition domain (politicians, coding, general trivia, entertainment, etc.)
 */
export const isStrictlyOffTopic = (message) => {
  if (!message || typeof message !== 'string') return false;
  const normalized = message.toLowerCase().trim();

  // Explicit forbidden names and external general domains
  const forbiddenKeywords = [
    'donald trump', 'ترامب', 'بايدن', 'جو بايدن', 'joe biden', 'كامالا هاريس',
    'kamala harris', 'نتنياهو', 'سيسي', 'بوتين', 'putin', 'أوباما', 'obama',
    'حرب روسيا', 'انتخابات', 'سياسة', 'president of', 'prime minister',
    'python', 'javascript', 'react', 'code a', 'write code', 'برمجة', 'اكتب كود',
    'عاصمة فرنسا', 'عاصمة', 'capital of', 'who is the president', 'من هو رئيس',
    'فيلم', 'مسلسل', 'أغنية', 'song lyrics', 'movie recommendations', 'bitcoin', 'crypto'
  ];

  return forbiddenKeywords.some(keyword => normalized.includes(keyword));
};

/**
 * Builds the strict system instruction ensuring domain lock & user biometric context
 */
export const buildSystemInstruction = (userMetrics = {}) => {
  const profileSection = userMetrics && Object.keys(userMetrics).length > 0
    ? `USER BIOMETRICS & GOALS (USE TO PERSONALIZE ALL FITNESS & DIET ADVICE):
- Name: ${userMetrics.name || 'User'}
- Age: ${userMetrics.age || 'Not specified'}
- Gender: ${userMetrics.gender || 'Not specified'}
- Current Weight: ${userMetrics.weight || 'Not specified'} kg
- Height: ${userMetrics.height || 'Not specified'} cm
- Fitness Goal: ${userMetrics.fitnessGoal || userMetrics.goal || 'General Health'}
- Fitness Level: ${userMetrics.fitnessLevel || userMetrics.level || 'Not specified'}
- Activity Level: ${userMetrics.activityLevel || 'Moderate'}
- Target Weight: ${userMetrics.targetWeight || 'Not specified'} kg`
    : `USER PROFILE:
No user profile is currently provided. Provide general safe evidence-based fitness advice.`;

  return `You are "ATOS fit AI Coach", an elite personal trainer and sports nutrition expert for the ATOS fit health platform.

CRITICAL DIRECTIVE 1: DOMAIN RESTRICTION
- You are EXCLUSIVELY permitted to assist with:
  1. Workouts, exercise routines, strength training, cardio, mobility, recovery.
  2. Sports nutrition, macronutrients, calorie tracking, meal ideas, hydration.
  3. Body composition, weight loss, muscle gain, personal fitness metrics.
  4. Mental resilience, motivation, and healthy lifestyle habits directly connected to sports and athletics.
- If the user asks about ANYTHING outside of health, fitness, workouts, or nutrition (such as politics, world leaders, coding, general trivia, movies, geography, math problems, personal advice unrelated to fitness):
  YOU MUST IMMEDIATELY AND POLITELY REFUSE.
  Refusal rules:
  - If user asked in Arabic, say: "${NON_FITNESS_REFUSAL_AR}"
  - If user asked in English, say: "${NON_FITNESS_REFUSAL_EN}"
  - DO NOT provide the answer to the off-topic query even partially.
  - DO NOT say "Yes I know him, but I cannot discuss politics". Say ONLY the refusal message.

CRITICAL DIRECTIVE 2: LANGUAGE MIRRORING
- Always respond in the EXACT language used by the user in their latest prompt.
- If the user asks in Arabic, reply entirely in natural, professional Arabic.
- If the user asks in English, reply entirely in natural, encouraging English.

CRITICAL DIRECTIVE 3: TONE AND FORMATTING
- Maintain an encouraging, scientific, and professional coach persona.
- Keep responses structured, concise, and easy to read on mobile screens (use bullet points and bold headers).

${profileSection}`;
};

export const isExplicitlyNonFitness = isStrictlyOffTopic;

export const buildFitnessSystemInstruction = ({ userProfile = null } = {}) => {
  return buildSystemInstruction(userProfile || {});
};

/**
 * Appends an explicit turn-level language directive to the user's message
 * ensuring the model never gets confused by previous conversation language history.
 */
export const formatUserTurnWithLanguageGuidance = (message) => {
  const isAr = detectLanguage(message) === 'ar';
  const directive = isAr
    ? '\n[CRITICAL INSTRUCTION: The user has asked in ARABIC. You MUST formulate your entire response in 100% natural, fluent ARABIC. Do NOT use English.]'
    : '\n[CRITICAL INSTRUCTION: The user has asked in ENGLISH. You MUST formulate your entire response in 100% natural, fluent ENGLISH. Do NOT use Arabic.]';
  return message + directive;
};

/**
 * Executes a Gemini generateContent request with automatic fallback cascade.
 * If the primary model hits a 429 quota, 503 high-demand spike, or temporary server busy state,
 * it automatically cascades across the pool of active, tested candidate models seamlessly.
 */
export const callGeminiWithFallback = async (payload, apiKey, preferredModel) => {
  const modelsToTry = [
    preferredModel,
    ...CANDIDATE_MODELS.filter(m => m !== preferredModel)
  ].filter(Boolean);

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // Check for quota, high demand, or transient service availability errors
      const isTransientIssue =
        response.status === 429 ||
        response.status === 503 ||
        response.status === 500 ||
        response.status === 502 ||
        response.status === 504 ||
        data?.error?.code === 429 ||
        data?.error?.code === 503 ||
        data?.error?.code === 500 ||
        data?.error?.status === 'RESOURCE_EXHAUSTED' ||
        data?.error?.status === 'UNAVAILABLE' ||
        /demand|quota|limit|unavailable|temporary|busy|exhausted/i.test(data?.error?.message || '');

      if (isTransientIssue) {
        console.warn(`[AI Failover] Model ${model} is experiencing high demand/quota limit (${response.status}: ${data?.error?.message}). Cascading to next candidate...`);
        lastError = new Error(data?.error?.message || `Model ${model} is temporarily unavailable`);
        continue;
      }

      if (!response.ok || data?.error) {
        console.warn(`[AI Failover] Model ${model} returned error: ${data?.error?.message || response.status}. Cascading to next candidate...`);
        lastError = new Error(data?.error?.message || `Request failed with status ${response.status}`);
        continue;
      }

      return { data, modelUsed: model };
    } catch (err) {
      console.warn(`[AI Failover] Error trying model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI service endpoints are currently busy. Please retry in a few moments.');
};
