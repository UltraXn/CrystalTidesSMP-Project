import { describe, it, expect } from 'vitest';
import { validateWithLocalNLP } from '../services/suggestionValidatorService.js';

describe('Suggestion Validator (Local NLP)', () => {
    it('should reject short suggestions (<15 chars)', async () => {
        const result = await validateWithLocalNLP('hola');
        expect(result.isValid).toBe(false);
        expect(result.explanation).toContain('15 caracteres');
    });

    it('should reject repetitive spam patterns', async () => {
        const result = await validateWithLocalNLP('asdfghjkl zxcvbnm test test');
        expect(result.isValid).toBe(false);
    });

    it('should approve valid detailed suggestions', async () => {
        const result = await validateWithLocalNLP('Sería genial añadir eventos de pesca de noche en el océano del servidor');
        expect(result.isValid).toBe(true);
        expect(result.confidence).toBeGreaterThanOrEqual(0.75);
    });
});
