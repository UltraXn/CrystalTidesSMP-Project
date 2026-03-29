import { describe, it, expect } from 'vitest';
import { createTicketSchema, updateTicketStatusSchema } from '../schemas/ticketSchemas.js';

describe('Ticket Schemas Validation', () => {
    describe('createTicketSchema', () => {
        it('should allow "urgent" priority', () => {
            const validData = {
                body: {
                    title: 'System Crash',
                    description: 'The server is down and I cannot restart it from the panel.',
                    priority: 'urgent',
                    category: 'bug'
                }
            };
            const result = createTicketSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should allow standard priorities', () => {
            const result = createTicketSchema.safeParse({
                body: {
                    title: 'General Query',
                    description: 'How do I join the community Discord server?',
                    priority: 'low'
                }
            });
            expect(result.success).toBe(true);
        });
    });

    describe('updateTicketStatusSchema', () => {
        it('should allow "pending" and "resolved" statuses', () => {
            const statuses = ['pending', 'resolved', 'open', 'closed'];
            statuses.forEach(status => {
                const result = updateTicketStatusSchema.safeParse({
                    body: { status }
                });
                expect(result.success, `Should allow status: ${status}`).toBe(true);
            });
        });

        it('should reject "in_progress" status (no longer in DB)', () => {
            const result = updateTicketStatusSchema.safeParse({
                body: { status: 'in_progress' }
            });
            expect(result.success).toBe(false);
        });

        it('should reject invalid statuses', () => {
            const result = updateTicketStatusSchema.safeParse({
                body: { status: 'invalid_status' }
            });
            expect(result.success).toBe(false);
        });
    });
});
