export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  explanation: string;
  engine: 'gemini_flash' | 'local_nlp';
}

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  parts?: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
}

interface GeminiApiResponse {
  candidates?: GeminiCandidate[];
}

interface GeminiParsedPayload {
  isValid?: unknown;
  confidence?: unknown;
  explanation?: unknown;
}

const ENGINE_LOCAL_NLP = 'local_nlp';
const ENGINE_GEMINI_FLASH = 'gemini_flash';

const MIN_LENGTH = 15;
const MIN_WORDS_FOR_DIVERSITY = 3;
const MIN_LEXICAL_DIVERSITY = 0.4;

const PROHIBITED_PATTERNS: readonly RegExp[] = [
  /asdf/i,
  /qwer/i,
  /zxcv/i,
  /(.)\1{5,}/i, // Caracteres repetidos 6+ veces
  /^test$/i,
  /^hola$/i,
  /^a+$/i,
];

const SERVER_KEYWORDS: readonly string[] = [
  'minecraft',
  'server',
  'servidor',
  'mod',
  'boss',
  'jefe',
  'item',
  'ítem',
  'arma',
  'armadura',
  'gacha',
  'mercado',
  'bolsa',
  'kc',
  'killucoin',
  'plugin',
  'mapa',
  'craft',
  'crafteo',
  'evento',
  'recompensa',
  'pvp',
  'pve',
  'discord',
  'sculk',
  'cataclysm',
  'mowzie',
  'nether',
  'end',
  'dimension',
  'mazmorra',
];

function checkMinimumLength(trimmed: string): ValidationResult | null {
  if (trimmed.length < MIN_LENGTH) {
    return {
      isValid: false,
      confidence: 1.0,
      explanation: `La sugerencia debe contener al menos ${MIN_LENGTH} caracteres.`,
      engine: ENGINE_LOCAL_NLP,
    };
  }
  return null;
}

function checkProhibitedPatterns(trimmed: string): ValidationResult | null {
  const hasViolation = PROHIBITED_PATTERNS.some((pattern) => pattern.test(trimmed));
  if (hasViolation) {
    return {
      isValid: false,
      confidence: 0.9,
      explanation: 'La sugerencia contiene patrones repetitivos o texto de prueba no válido.',
      engine: ENGINE_LOCAL_NLP,
    };
  }
  return null;
}

function checkLexicalDiversity(words: readonly string[]): ValidationResult | null {
  if (words.length < MIN_WORDS_FOR_DIVERSITY) {
    return null;
  }

  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;

  if (lexicalDiversity < MIN_LEXICAL_DIVERSITY) {
    return {
      isValid: false,
      confidence: 0.85,
      explanation: 'Poca variedad léxica detectada. Describe tu propuesta con más detalle.',
      engine: ENGINE_LOCAL_NLP,
    };
  }

  return null;
}

function calculateKeywordConfidence(words: readonly string[]): number {
  const matchesKeyword = words.some((word) =>
    SERVER_KEYWORDS.some((keyword) => word.includes(keyword)),
  );
  return matchesKeyword ? 0.95 : 0.75;
}

export async function validateWithLocalNLP(message: string): Promise<ValidationResult> {
  const trimmed = message.trim();

  const lengthViolation = checkMinimumLength(trimmed);
  if (lengthViolation) {
    return lengthViolation;
  }

  const patternViolation = checkProhibitedPatterns(trimmed);
  if (patternViolation) {
    return patternViolation;
  }

  const words = trimmed.toLowerCase().split(/\s+/);
  const diversityViolation = checkLexicalDiversity(words);
  if (diversityViolation) {
    return diversityViolation;
  }

  return {
    isValid: true,
    confidence: calculateKeywordConfidence(words),
    explanation: 'Propuesta válida evaluada mediante análisis sintáctico local.',
    engine: ENGINE_LOCAL_NLP,
  };
}

function buildGeminiPrompt(message: string): string {
  return `Eres el validador automático de sugerencias para el servidor de Minecraft CrystalTides SMP.
Evalúa si la siguiente propuesta enviada por un usuario es una sugerencia coherente, respetuosa y relevante para un servidor de Minecraft o su plataforma web.

REGLAS DE EVALUACIÓN:
- VÁLIDA: Si aporta una idea, mejora, reporte o consulta constructiva para el juego, la web, los mods o la comunidad.
- INVÁLIDA: Si es spam, caracteres aleatorios (ej: "asdfghjkl"), insultos, texto vacío de sentido o pruebas sin contenido.

PROPUESTA: "${message}"

Responde ESTRICTAMENTE en formato JSON plano sin bloques markdown:
{"isValid": true|false, "confidence": 0.0-1.0, "explanation": "razón breve en español"}`;
}

function parseGeminiResponse(rawText: string): ValidationResult | null {
  if (!rawText) {
    return null;
  }

  const cleanJson = rawText.replaceAll('```json', '').replaceAll('```', '').trim();
  const parsed = JSON.parse(cleanJson) as GeminiParsedPayload;

  if (typeof parsed.isValid !== 'boolean') {
    return null;
  }

  const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.9;
  const defaultExplanation = parsed.isValid
    ? 'Sugerencia aprobada por Gemini AI.'
    : 'Sugerencia no válida.';
  const explanation =
    typeof parsed.explanation === 'string' && parsed.explanation.length > 0
      ? parsed.explanation
      : defaultExplanation;

  return {
    isValid: parsed.isValid,
    confidence,
    explanation,
    engine: ENGINE_GEMINI_FLASH,
  };
}

async function validateWithGemini(
  message: string,
  apiKey: string,
): Promise<ValidationResult | null> {
  try {
    const prompt = buildGeminiPrompt(message);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as GeminiApiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    return parseGeminiResponse(text);
  } catch (error) {
    console.warn(
      '[SuggestionValidator] Fallback to Local NLP due to REST API call failure:',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export async function validateSuggestion(message: string): Promise<ValidationResult> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_KEY;

  if (apiKey) {
    const geminiResult = await validateWithGemini(message, apiKey);
    if (geminiResult) {
      return geminiResult;
    }
  }

  return validateWithLocalNLP(message);
}
