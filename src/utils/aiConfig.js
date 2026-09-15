/**
 * ATOS fit AI & Gemini Configuration & Strict Guard System
 * Ensures the AI Coach NEVER leaves the fitness & nutrition domain,
 * provides zero-hallucination refusals, mirrors user language,
 * and seamlessly handles model failover across high-availability Gemini models.
 */

export const DEFAULT_CHATBOT_API_KEY = 'AQ.Ab8RN6K3qSM-0g7LcfL1ka7OE7rgqfSxMGZ8wiEKySoSxkBOlw';
export const DEFAULT_CHATBOT_MODEL = 'gemini-3.5-flash';

// Resilient pool of active models to automatically failover if one hits rate limits (429) or high demand (503)
export const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash'
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
export const isExplicitlyNonFitness = (text) => {
  if (!text || typeof text !== 'string') return false;
  const clean = text.toLowerCase().trim();

  // Politics, politicians, world leaders, geopolitical terms
  const politicsPatterns = [
    'ترامب', 'دونالد ترامب', 'بايدن', 'أوباما', 'بوتين', 'السيسي', 'نتنياهو',
    'رئيس', 'رؤساء', 'وزير', 'سياسة', 'حكومة', 'انتخابات', 'برلمان', 'حرب', 'جيش',
    'trump', 'donald trump', 'biden', 'obama', 'putin', 'president', 'politics',
    'minister', 'election', 'parliament', 'congress', 'senate', 'military'
  ];

  // Tech, programming, coding, IT
  const techPatterns = [
    'بايثون', 'جافاسكريبت', 'برمجة', 'كود', 'خوارزمية', 'هاكر', 'ويندوز', 'لينكس', 'رياكت',
    'python', 'javascript', 'html', 'css', 'java', 'c++', 'c#', 'php', 'swift',
    'programming', 'write code', 'write a code', 'coding', 'algorithm', 'hacker', 'database', 'sql'
  ];

  // General trivia, geography, history (unrelated to athletic training)
  const triviaPatterns = [
    'عاصمة', 'نهر النيل', 'جبل إيفرست', 'الحرب العالمية', 'تاريخ فرنسا',
    'capital of', 'who was the president', 'who is the president',
    'world war', 'history of france', 'history of america'
  ];

  // Entertainment / pop culture (actors, singers, movies, pop songs)
  const entertainmentPatterns = [
    'فيلم', 'مسلسل', 'ممثل', 'ممثلة', 'مغني', 'مغنية', 'أغنية',
    'movie', 'cinema', 'actor', 'actress', 'singer', 'song', 'hollywood'
  ];

  const allForbidden = [
    ...politicsPatterns,
    ...techPatterns,
    ...triviaPatterns,
    ...entertainmentPatterns
  ];

  return allForbidden.some(pattern => clean.includes(pattern));
};

/**
 * Builds the official Gemini system_instruction parameter.
 */
export const buildFitnessSystemInstruction = ({ userProfile = null } = {}) => {
  let profileSection = '';
  if (userProfile) {
    const age = userProfile.age || 'Unknown';
    const height = userProfile.height || 'Unknown';
    const weight = userProfile.weight || userProfile.bodyWeight || 'Unknown';
    const fitnessLevel = userProfile.fitnessLevel || 'Unknown';
    const goal = userProfile.goal || userProfile.primaryGoal || (Array.isArray(userProfile.goals) ? userProfile.goals.join(', ') : 'Unknown');
    profileSection = `
Athlete Profile:
- Name: ${userProfile.name || userProfile.fullName || 'Athlete'}
- Age: ${age}
- Height: ${height} cm
- Weight: ${weight} kg
- Fitness Level: ${fitnessLevel}
- Target Goal: ${goal}
`;
  }

  return `You are ATOS FIT AI Coach, an elite certified personal trainer and sports nutritionist integrated into the ATOS fit application.

CRITICAL DIRECTIVE 1: STRICT AND EXCLUSIVE FITNESS SCOPE (ZERO TOLERANCE)
You are strictly limited to physical fitness, workouts, body mechanics, exercise form, athletic conditioning, sports nutrition, caloric intake, macros, hydration, recovery, and stretching.
If the user asks ANY question outside this domain:
- NEVER answer or explain the topic, even briefly.
- NEVER say "Yes, I know who X is" or give facts about a person, politician, celebrity, movie, coding language, or event.
- NEVER offer to discuss a celebrity's workout routine if asked who they are.
- IMMEDIATELY refuse using one polite sentence, and ask how you can help with their workout or diet.
- Arabic refusal template: "${NON_FITNESS_REFUSAL_AR}"
- English refusal template: "${NON_FITNESS_REFUSAL_EN}"

CRITICAL DIRECTIVE 2: DYNAMIC LANGUAGE MIRRORING
- If the user writes in Arabic -> reply ONLY in natural, fluent Arabic.
- If the user writes in English -> reply ONLY in natural, concise English.
- Always match the user's language turn-by-turn with zero exceptions.

CRITICAL DIRECTIVE 3: TONE AND FORMATTING
- Encouraging, concise, scientifically accurate, and athletic.
- Plain text only. Do NOT use markdown symbols like #, ##, ###, **, *, -, or ---.
- Keep responses compact, clean, and direct.
${profileSection}`;
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
 * If the primary model hits a 429 quota or 503 high-demand spike, it automatically
 * retries the exact query on alternative active Gemini models seamlessly.
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

      // Check for quota or service availability errors to trigger auto-failover
      const isQuotaOrDemandIssue =
        response.status === 429 ||
        response.status === 503 ||
        data?.error?.code === 429 ||
        data?.error?.code === 503 ||
        data?.error?.status === 'RESOURCE_EXHAUSTED' ||
        data?.error?.status === 'UNAVAILABLE';

      if (isQuotaOrDemandIssue) {
        console.warn(`[AI Failover] Model ${model} returned ${response.status} (${data?.error?.message}). Falling over to next candidate...`);
        lastError = new Error(data?.error?.message || `Model ${model} unavailable`);
        continue;
      }

      if (!response.ok || data?.error) {
        throw new Error(data?.error?.message || `Request failed with status ${response.status}`);
      }

      return { data, modelUsed: model };
    } catch (err) {
      console.warn(`[AI Failover] Error trying model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI service endpoints are currently busy. Please retry in a few moments.');
};
