interface ValidationResult {
    isValid: boolean;
    confidence: number;
    explanation: string;
    engine: 'gemini_flash' | 'local_nlp';
}

const MIN_LENGTH = 15;
const PROHIBITED_PATTERNS = [
    /asdf/i,
    /qwer/i,
    /zxcv/i,
    /(.)\1{5,}/i, // Caracteres repetidos 6+ veces
    /^test$/i,
    /^hola$/i,
    /^a+$/i
];

const SERVER_KEYWORDS = [
    'minecraft', 'server', 'servidor', 'mod', 'boss', 'jefe', 'item', 'ítem',
    'arma', 'armadura', 'gacha', 'mercado', 'bolsa', 'kc', 'killucoin', 'plugin',
    'mapa', 'craft', 'crafteo', 'evento', 'recompensa', 'pvp', 'pve', 'discord',
    'sculk', 'cataclysm', 'mowzie', 'nether', 'end', 'dimension', 'mazmorra'
];

export async function validateWithLocalNLP(message: string): Promise<ValidationResult> {
    const trimmed = message.trim();
    if (trimmed.length < MIN_LENGTH) {
        return {
            isValid: false,
            confidence: 1.0,
            explanation: `La sugerencia debe contener al menos ${MIN_LENGTH} caracteres.`,
            engine: 'local_nlp'
        };
    }

    for (const pattern of PROHIBITED_PATTERNS) {
        if (pattern.test(trimmed)) {
            return {
                isValid: false,
                confidence: 0.9,
                explanation: 'La sugerencia contiene patrones repetitivos o texto de prueba no válido.',
                engine: 'local_nlp'
            };
        }
    }

    const words = trimmed.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const lexicalDiversity = uniqueWords.size / words.length;

    if (words.length >= 3 && lexicalDiversity < 0.4) {
        return {
            isValid: false,
            confidence: 0.85,
            explanation: 'Poca variedad léxica detectada. Describe tu propuesta con más detalle.',
            engine: 'local_nlp'
        };
    }

    const matchesKeyword = words.some(w => SERVER_KEYWORDS.some(k => w.includes(k)));
    const confidence = matchesKeyword ? 0.95 : 0.75;

    return {
        isValid: true,
        confidence,
        explanation: 'Propuesta válida evaluada mediante análisis sintáctico local.',
        engine: 'local_nlp'
    };
}

export async function validateSuggestion(message: string): Promise<ValidationResult> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;

    if (apiKey) {
        try {
            const prompt = `Eres el validador automático de sugerencias para el servidor de Minecraft CrystalTides SMP.
Evalúa si la siguiente propuesta enviada por un usuario es una sugerencia coherente, respetuosa y relevante para un servidor de Minecraft o su plataforma web.

REGLAS DE EVALUACIÓN:
- VÁLIDA: Si aporta una idea, mejora, reporte o consulta constructiva para el juego, la web, los mods o la comunidad.
- INVÁLIDA: Si es spam, caracteres aleatorios (ej: "asdfghjkl"), insultos, texto vacío de sentido o pruebas sin contenido.

PROPUESTA: "${message}"

Responde ESTRICTAMENTE en formato JSON plano sin bloques markdown:
{"isValid": true|false, "confidence": 0.0-1.0, "explanation": "razón breve en español"}`;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (res.ok) {
                const data = await res.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
                const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanJson);

                if (typeof parsed.isValid === 'boolean') {
                    return {
                        isValid: parsed.isValid,
                        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
                        explanation: parsed.explanation || (parsed.isValid ? 'Sugerencia aprobada por Gemini AI.' : 'Sugerencia no válida.'),
                        engine: 'gemini_flash'
                    };
                }
            }
        } catch (error) {
            console.warn('[SuggestionValidator] Fallback to Local NLP due to REST API call failure:', error instanceof Error ? error.message : error);
        }
    }

    return validateWithLocalNLP(message);
}
