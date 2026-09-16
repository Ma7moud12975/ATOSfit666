import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { getChatbotApiKey, getChatbotModelName, callGeminiWithFallback } from '../../../utils/aiConfig';
import { parseFoodAnalysisResponse } from '../../../utils/foodAnalysisNormalizer';

const CHATBOT_API_KEY = getChatbotApiKey();
const CHATBOT_MODEL = getChatbotModelName();

const SERVING_PRESETS = [
  { label: '30g', value: 30 },
  { label: '50g', value: 50 },
  { label: '100g', value: 100 },
  { label: '150g', value: 150 },
  { label: '200g', value: 200 },
  { label: '300g', value: 300 },
];

const MACRO_CFG = {
  protein: { color: '#60a5fa', labelAr: 'بروتين',     labelEn: 'Protein', icon: 'Beef'     },
  carbs:   { color: '#34d399', labelAr: 'كربوهيدرات', labelEn: 'Carbs',   icon: 'Wheat'    },
  fats:    { color: '#f59e0b', labelAr: 'دهون',        labelEn: 'Fats',    icon: 'Droplets' },
};

/**
 * Offline macro estimator — used when the AI returns zeros or fails.
 * Based on average macros per 100 kcal from USDA composition data.
 * All values are scaled to the requested weight.
 */
const FOOD_DB = [
  { k: /rice|أرز/i,                   kcalPer100: 130, p: 2.7,  c: 28,   f: 0.3  },
  { k: /chicken|دجاج/i,               kcalPer100: 165, p: 31,   c: 0,    f: 3.6  },
  { k: /beef|steak|لحم/i,             kcalPer100: 250, p: 26,   c: 0,    f: 17   },
  { k: /egg|بيض/i,                    kcalPer100: 155, p: 13,   c: 1.1,  f: 11   },
  { k: /bread|عيش|خبز/i,              kcalPer100: 265, p: 9,    c: 49,   f: 3.2  },
  { k: /pasta|macaroni|مكرونة/i,      kcalPer100: 158, p: 5.8,  c: 31,   f: 0.9  },
  { k: /potato|بطاطا/i,               kcalPer100: 77,  p: 2,    c: 17,   f: 0.1  },
  { k: /banana|موز/i,                 kcalPer100: 89,  p: 1.1,  c: 23,   f: 0.3  },
  { k: /apple|تفاح/i,                 kcalPer100: 52,  p: 0.3,  c: 14,   f: 0.2  },
  { k: /milk|laban|لبن|حليب/i,        kcalPer100: 61,  p: 3.2,  c: 4.8,  f: 3.3  },
  { k: /yogurt|زبادي/i,               kcalPer100: 59,  p: 10,   c: 3.6,  f: 0.4  },
  { k: /oat|شوفان/i,                  kcalPer100: 389, p: 17,   c: 66,   f: 7    },
  { k: /cheese|جبن/i,                 kcalPer100: 402, p: 25,   c: 1.3,  f: 33   },
  { k: /salmon|سمك|fish/i,            kcalPer100: 208, p: 20,   c: 0,    f: 13   },
  { k: /tuna|تونة/i,                  kcalPer100: 116, p: 26,   c: 0,    f: 1    },
  { k: /chocolate|شوكولاتة/i,         kcalPer100: 546, p: 5,    c: 60,   f: 31   },
  { k: /burger|برجر/i,                kcalPer100: 295, p: 17,   c: 24,   f: 14   },
  { k: /pizza/i,                      kcalPer100: 266, p: 11,   c: 33,   f: 10   },
  { k: /almond|لوز|nuts|مكسرات/i,     kcalPer100: 579, p: 21,   c: 22,   f: 50   },
  { k: /lentil|عدس/i,                 kcalPer100: 116, p: 9,    c: 20,   f: 0.4  },
  { k: /cucumber|خيار/i,              kcalPer100: 15,  p: 0.7,  c: 3.6,  f: 0.1  },
  { k: /tomato|طماطم/i,               kcalPer100: 18,  p: 0.9,  c: 3.9,  f: 0.2  },
  { k: /salad|سلطة/i,                 kcalPer100: 20,  p: 1.5,  c: 3,    f: 0.3  },
  { k: /hummus|حمص/i,                 kcalPer100: 177, p: 8,    c: 20,   f: 8.6  },
  { k: /falafel|فلافل/i,              kcalPer100: 333, p: 13,   c: 32,   f: 18   },
  { k: /kebab|كباب|grilled/i,         kcalPer100: 220, p: 24,   c: 2,    f: 13   },
  { k: /juice|عصير/i,                 kcalPer100: 46,  p: 0.4,  c: 11,   f: 0.1  },
  { k: /cola|soda|pepsi/i,            kcalPer100: 42,  p: 0,    c: 10.6, f: 0    },
  { k: /coffee|قهوة/i,                kcalPer100: 2,   p: 0.3,  c: 0,    f: 0    },
  { k: /shawarma|شاورما/i,            kcalPer100: 210, p: 14,   c: 18,   f: 9    },
  { k: /kushari|كشري/i,               kcalPer100: 120, p: 4,    c: 24,   f: 1.5  },
  { k: /ful|فول/i,                    kcalPer100: 110, p: 7,    c: 18,   f: 0.5  },
  { k: /sweet potato|بطاطا حلوة/i,   kcalPer100: 86,  p: 1.6,  c: 20,   f: 0.1  },
  { k: /avocado|أفوكادو/i,            kcalPer100: 160, p: 2,    c: 9,    f: 15   },
  { k: /peanut butter|زبدة فول/i,     kcalPer100: 588, p: 25,   c: 20,   f: 50   },
  { k: /whey|protein shake|بروتين/i,  kcalPer100: 400, p: 75,   c: 8,    f: 8    },
];

function offlineEstimate(name, weightG) {
  const w = weightG / 100;
  for (const row of FOOD_DB) {
    if (row.k.test(name)) {
      return {
        name,
        calories:      Math.round(row.kcalPer100 * w),
        protein:       Math.round(row.p  * w),
        carbohydrates: Math.round(row.c  * w),
        fat:           Math.round(row.f  * w),
        sugar:         0,
        serving_size:  `${weightG}g`,
      };
    }
  }
  // Generic fallback: 2 kcal/g mixed diet
  const kcal = Math.round(2 * weightG);
  return {
    name,
    calories:      kcal,
    protein:       Math.round(kcal * 0.15 / 4),
    carbohydrates: Math.round(kcal * 0.50 / 4),
    fat:           Math.round(kcal * 0.35 / 9),
    sugar:         0,
    serving_size:  `${weightG}g`,
  };
}

const ManualFoodEntryModal = ({ isOpen, onClose, onSave, language = 'ar' }) => {
  const ar = language === 'ar';

  const [step, setStep] = useState('input'); // 'input' | 'estimating' | 'result'
  const [foodName, setFoodName] = useState('');
  const [weightG, setWeightG] = useState(100);
  const [customWeight, setCustomWeight] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);
  const customInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setFoodName('');
      setWeightG(100);
      setCustomWeight('');
      setUseCustom(false);
      setResult(null);
      setError('');
      setIsSaving(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const effectiveWeight = useCustom
    ? Math.max(1, Math.min(5000, Number(customWeight) || 1))
    : weightG;

  const handleEstimate = async () => {
    if (!foodName.trim()) {
      setError(ar ? 'اكتب اسم الأكل أولاً' : 'Please enter a food name first');
      return;
    }
    setError('');
    setStep('estimating');

    try {
      // Build a prompt that forces plain JSON without any markdown or explanation
      const prompt = `Nutrition facts for "${foodName.trim()}", serving size: ${effectiveWeight}g.
Reply with ONLY a valid JSON object. No markdown. No explanation. No code fences.
Example format: {"name":"food name","calories":250,"protein":20,"carbohydrates":30,"fat":8,"sugar":3,"fiber":2,"serving_size":"${effectiveWeight}g"}
Scale all values accurately to exactly ${effectiveWeight}g.`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        // NO responseMimeType — not supported by flash-lite models; plain text is more reliable
        generationConfig: { temperature: 0.05, maxOutputTokens: 512 },
      };

      const { data } = await callGeminiWithFallback(payload, CHATBOT_API_KEY, CHATBOT_MODEL);

      // Extract text from response
      let rawText = '';
      const parts = data?.candidates?.[0]?.content?.parts;
      if (Array.isArray(parts)) {
        rawText = parts.map(p => p.text || '').join('').trim();
      }

      console.log('[ManualFoodEntry] raw AI text:', rawText);

      // Try to extract JSON from anywhere in the response text
      let parsed = null;

      // 1. Direct parse attempt
      try { parsed = JSON.parse(rawText); } catch {}

      // 2. Extract JSON object pattern
      if (!parsed) {
        const match = rawText.match(/\{[\s\S]*?\}/);
        if (match) {
          try { parsed = JSON.parse(match[0]); } catch {}
        }
      }

      // 3. Strip markdown fences and try again
      if (!parsed) {
        const clean = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        try { parsed = JSON.parse(clean); } catch {}
        if (!parsed) {
          const m2 = clean.match(/\{[\s\S]*?\}/);
          if (m2) { try { parsed = JSON.parse(m2[0]); } catch {} }
        }
      }

      // 4. Use parseFoodAnalysisResponse as last resort
      if (!parsed) {
        parsed = parseFoodAnalysisResponse(rawText);
      }

      // 5. Hard offline fallback — estimate from food name keywords
      if (!parsed || (Number(parsed.calories || 0) === 0 && Number(parsed.protein || 0) === 0)) {
        console.warn('[ManualFoodEntry] AI returned zeros/null — using offline estimator');
        parsed = offlineEstimate(foodName.trim(), effectiveWeight);
      }

      if (!parsed) throw new Error('Could not estimate nutrition');

      // Build normalized result
      const cal    = Math.round(Number(parsed.calories || parsed.kcal || parsed.energy || 0));
      const prot   = Math.round(Number(parsed.protein || parsed.protein_g || 0));
      const carbs  = Math.round(Number(parsed.carbohydrates || parsed.carbs || parsed.carbs_g || 0));
      const fat    = Math.round(Number(parsed.fat || parsed.fats || parsed.fat_g || 0));
      const sugar  = Math.round(Number(parsed.sugar || parsed.sugars || 0));

      setResult({
        name:        foodName.trim(),
        calories:    cal,
        protein:     prot,
        carbs:       carbs,
        fats:        fat,
        sugar:       sugar,
        servingSize: `${effectiveWeight}g`,
        entryMethod: 'manual',
        dateLogged:  new Date().toISOString(),
      });
      setStep('result');
    } catch (err) {
      console.error('[ManualFoodEntry] estimation error:', err);
      setError(ar
        ? 'فشل تقدير القيم الغذائية، حاول مرة أخرى'
        : 'Failed to estimate nutrition. Please try again.');
      setStep('input');
    }
  };

  const handleSave = async () => {
    if (!result || isSaving) return;
    setIsSaving(true);
    try {
      await onSave(result);
      onClose();
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && step === 'input') handleEstimate();
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 10000,
          animation: 'mfe-fade 0.2s ease',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 10001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
        onKeyDown={handleKeyDown}
      >
        <div
          dir={ar ? 'rtl' : 'ltr'}
          style={{
            background: 'var(--bento-card, #1a1a2e)',
            border: '1px solid var(--bento-border, rgba(255,255,255,0.08))',
            borderRadius: '24px',
            padding: '1.75rem',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(250,168,2,0.1)',
            animation: 'mfe-slide 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >

          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 42, height: 42, borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(250,168,2,0.25), rgba(250,168,2,0.06))',
                border: '1.5px solid rgba(250,168,2,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name="PencilLine" size={20} color="#FAA802" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--bento-text, #fff)' }}>
                  {ar ? 'إضافة وجبة يدوياً' : 'Log Food Manually'}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--bento-muted, #888)' }}>
                  {ar ? 'اسم الأكل + الوزن → الذكاء الاصطناعي يحسب الماكروز' : 'Name + weight → AI estimates macros'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '1px solid var(--bento-border, rgba(255,255,255,0.08))',
                background: 'transparent', color: 'var(--bento-muted, #888)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Icon name="X" size={16} />
            </button>
          </div>

          {/* ── INPUT STEP ── */}
          {(step === 'input' || step === 'estimating') && (
            <>
              {/* Food Name */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--bento-muted, #888)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  {ar ? 'اسم الأكل' : 'Food Name'}
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', [ar ? 'right' : 'left']: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <Icon name="Utensils" size={15} color="#FAA802" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={foodName}
                    onChange={e => { setFoodName(e.target.value); setError(''); }}
                    placeholder={ar ? 'مثلاً: أرز بالدجاج، ستيك، تفاحة...' : 'e.g. grilled chicken, banana, oatmeal...'}
                    dir={ar ? 'rtl' : 'ltr'}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--bento-field, rgba(255,255,255,0.04))',
                      border: `1.5px solid ${error ? 'rgba(248,113,113,0.6)' : 'var(--bento-border, rgba(255,255,255,0.08))'}`,
                      borderRadius: '14px',
                      padding: ar ? '0.82rem 2.7rem 0.82rem 1rem' : '0.82rem 1rem 0.82rem 2.7rem',
                      color: 'var(--bento-text, #fff)', fontSize: '0.95rem', fontWeight: 600,
                      outline: 'none', transition: 'border-color 0.18s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(250,168,2,0.5)'}
                    onBlur={e => e.target.style.borderColor = error ? 'rgba(248,113,113,0.6)' : 'var(--bento-border, rgba(255,255,255,0.08))'}
                  />
                </div>
                {error && <p style={{ margin: '5px 0 0', fontSize: '0.73rem', color: '#f87171', fontWeight: 700 }}>{error}</p>}
              </div>

              {/* Weight */}
              <div style={{ marginBottom: '1.4rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--bento-muted, #888)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                  {ar ? 'الكمية / الوزن' : 'Serving Size / Weight'}
                </label>

                {/* Presets */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  {SERVING_PRESETS.map(p => {
                    const active = !useCustom && weightG === p.value;
                    return (
                      <button
                        key={p.value}
                        onClick={() => { setWeightG(p.value); setUseCustom(false); }}
                        style={{
                          padding: '0.42rem 0.95rem', borderRadius: '999px',
                          border: `1.5px solid ${active ? '#FAA802' : 'var(--bento-border, rgba(255,255,255,0.08))'}`,
                          background: active ? 'rgba(250,168,2,0.16)' : 'var(--bento-field, rgba(255,255,255,0.04))',
                          color: active ? '#FAA802' : 'var(--bento-muted, #888)',
                          fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                          fontFamily: 'JetBrains Mono, monospace',
                          transition: 'all 0.15s',
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}

                  {/* Custom toggle */}
                  <button
                    onClick={() => {
                      setUseCustom(prev => {
                        const next = !prev;
                        if (next) setTimeout(() => customInputRef.current?.focus(), 60);
                        return next;
                      });
                    }}
                    style={{
                      padding: '0.42rem 0.95rem', borderRadius: '999px',
                      border: `1.5px solid ${useCustom ? '#FAA802' : 'var(--bento-border, rgba(255,255,255,0.08))'}`,
                      background: useCustom ? 'rgba(250,168,2,0.16)' : 'var(--bento-field, rgba(255,255,255,0.04))',
                      color: useCustom ? '#FAA802' : 'var(--bento-muted, #888)',
                      fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon name="Pencil" size={12} />
                    {ar ? 'مخصص' : 'Custom'}
                  </button>
                </div>

                {/* Custom input row */}
                {useCustom && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      ref={customInputRef}
                      type="number" min="1" max="5000"
                      value={customWeight}
                      onChange={e => setCustomWeight(e.target.value)}
                      placeholder="0"
                      style={{
                        flex: 1, background: 'var(--bento-field, rgba(255,255,255,0.04))',
                        border: '1.5px solid rgba(250,168,2,0.4)', borderRadius: '12px',
                        padding: '0.55rem 0.85rem', color: 'var(--bento-text, #fff)',
                        fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                        textAlign: 'center', outline: 'none',
                      }}
                    />
                    <span style={{ color: 'var(--bento-muted, #888)', fontSize: '0.85rem', fontWeight: 700 }}>g</span>
                    <span style={{ color: '#FAA802', fontSize: '0.82rem', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', minWidth: '50px' }}>
                      = {effectiveWeight}g
                    </span>
                  </div>
                )}

                {!useCustom && (
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="Scale" size={13} color="var(--bento-muted, #888)" />
                    <span style={{ color: 'var(--bento-muted, #888)', fontSize: '0.78rem', fontWeight: 700 }}>
                      {ar ? `الحصة المختارة: ` : 'Selected: '}
                      <span style={{ color: '#FAA802', fontFamily: 'JetBrains Mono, monospace' }}>{effectiveWeight}g</span>
                    </span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={handleEstimate}
                disabled={step === 'estimating' || !foodName.trim()}
                style={{
                  width: '100%', padding: '0.95rem', borderRadius: '16px', border: 'none',
                  background: !foodName.trim()
                    ? 'var(--bento-field, rgba(255,255,255,0.05))'
                    : step === 'estimating'
                      ? 'linear-gradient(135deg, rgba(250,168,2,0.5), rgba(251,181,2,0.5))'
                      : 'linear-gradient(135deg, #FAA802, #FBB502)',
                  color: !foodName.trim() ? 'var(--bento-muted, #666)' : '#111',
                  fontSize: '0.92rem', fontWeight: 900,
                  cursor: !foodName.trim() || step === 'estimating' ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: foodName.trim() && step !== 'estimating' ? '0 8px 24px rgba(250,168,2,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {step === 'estimating' ? (
                  <>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: '2.5px solid rgba(17,17,17,0.25)', borderTopColor: '#111',
                      animation: 'mfe-spin 0.7s linear infinite',
                    }} />
                    {ar ? 'جاري تحليل الذكاء الاصطناعي...' : 'AI Analyzing...'}
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" size={18} />
                    {ar ? `تقدير الـ Macros لـ ${effectiveWeight}g` : `Estimate Macros for ${effectiveWeight}g`}
                  </>
                )}
              </button>
            </>
          )}

          {/* ── RESULT STEP ── */}
          {step === 'result' && result && (
            <>
              {/* Meal summary bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '0.95rem 1.1rem',
                background: 'linear-gradient(135deg, rgba(250,168,2,0.13), rgba(251,181,2,0.04))',
                borderRadius: '16px', border: '1px solid rgba(250,168,2,0.25)',
                marginBottom: '1.15rem',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '13px',
                  background: 'rgba(250,168,2,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name="Sparkles" size={20} color="#FAA802" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: 'var(--bento-text, #fff)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {result.name}
                  </h3>
                  <span style={{ fontSize: '0.73rem', color: 'var(--bento-muted, #888)', fontWeight: 700 }}>
                    {ar ? `حجم الحصة: ${result.servingSize}` : `Serving: ${result.servingSize}`}
                  </span>
                </div>
                <div style={{ textAlign: ar ? 'left' : 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FAA802', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                    {result.calories}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--bento-muted, #888)', fontWeight: 700, textTransform: 'uppercase' }}>kcal</div>
                </div>
              </div>

              {/* Macro tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.2rem' }}>
                {Object.entries(MACRO_CFG).map(([key, cfg]) => {
                  const value = result[key];
                  return (
                    <div
                      key={key}
                      style={{
                        padding: '0.9rem 0.6rem',
                        borderRadius: '14px',
                        background: `linear-gradient(135deg, ${cfg.color}18, ${cfg.color}04)`,
                        border: `1px solid ${cfg.color}30`,
                        textAlign: 'center',
                        animation: 'mfe-fade 0.3s ease',
                      }}
                    >
                      <Icon name={cfg.icon} size={16} color={cfg.color} />
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.3rem', fontWeight: 900, color: 'var(--bento-text, #fff)', margin: '5px 0 2px' }}>
                        {value ?? '--'}<span style={{ fontSize: '0.7rem', color: cfg.color, marginLeft: 2 }}>g</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--bento-muted, #888)', fontWeight: 800, textTransform: 'uppercase' }}>
                        {ar ? cfg.labelAr : cfg.labelEn}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setStep('input'); setResult(null); }}
                  style={{
                    flex: 1, padding: '0.82rem', borderRadius: '14px',
                    border: '1.5px solid var(--bento-border, rgba(255,255,255,0.08))',
                    background: 'transparent', color: 'var(--bento-muted, #888)',
                    fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  <Icon name="RotateCcw" size={14} />
                  {ar ? 'تعديل' : 'Edit'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    flex: 2, padding: '0.82rem', borderRadius: '14px', border: 'none',
                    background: isSaving
                      ? 'linear-gradient(135deg,rgba(250,168,2,0.5),rgba(251,181,2,0.5))'
                      : 'linear-gradient(135deg,#FAA802,#FBB502)',
                    color: '#111', fontSize: '0.85rem', fontWeight: 900,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: !isSaving ? '0 6px 20px rgba(250,168,2,0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {isSaving ? (
                    <>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(17,17,17,0.25)', borderTopColor: '#111', animation: 'mfe-spin 0.7s linear infinite' }} />
                      {ar ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Icon name="CheckCircle" size={16} />
                      {ar ? 'حفظ الوجبة' : 'Log This Meal'}
                    </>
                  )}
                </button>
              </div>

              {/* AI note */}
              <p style={{ textAlign: 'center', marginTop: '0.9rem', marginBottom: 0, fontSize: '0.68rem', color: 'var(--bento-muted, #666)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Icon name="Sparkles" size={11} color="#FAA802" />
                {ar
                  ? 'مُقدَّر بواسطة Gemini AI · للدقة الأعلى، صوّر الوجبة'
                  : 'Estimated by Gemini AI · Scan a photo for higher accuracy'}
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes mfe-fade  { from { opacity:0 } to { opacity:1 } }
        @keyframes mfe-slide { from { opacity:0; transform:translateY(20px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes mfe-spin  { to { transform:rotate(360deg) } }
      `}</style>
    </>
  );
};

export default ManualFoodEntryModal;

