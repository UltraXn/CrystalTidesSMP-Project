import { describe, it, expect } from 'vitest';
import { slugify } from '../../utils/slugify';

describe('slugify', () => {
    it('should convert text to lowercase', () => {
        expect(slugify('HELLO WORLD')).toBe('hello_world');
    });

    it('should trim whitespace', () => {
        expect(slugify('  hello world  ')).toBe('hello_world');
    });

    it('should replace spaces with underscores', () => {
        expect(slugify('hello world')).toBe('hello_world');
    });

    it('should remove non-word characters', () => {
        expect(slugify('hello world! @#$%^&*()')).toBe('hello_world');
    });

    it('should handle multiple spaces and dashes', () => {
        expect(slugify('hello   world---test')).toBe('hello_world_test');
    });

    it('should handle alphanumeric input', () => {
        expect(slugify('React 19 Hooks')).toBe('react_19_hooks');
    });
});
