import { z } from 'zod';

export const createPollSchema = z.object({
    question: z.string().min(1, 'Question is required').max(500, 'Question is too long'),
    options: z.array(z.object({
        id: z.string().min(1, 'Option ID is required'),
        text: z.string().min(1, 'Option text is required')
    })).min(2, 'At least 2 options are required').max(10, 'Maximum 10 options allowed'),
    duration: z.number().int().min(10, 'Timer must be at least 10 seconds').max(600, 'Timer must be at most 10 minutes'),
    createdBy: z.string().min(1, 'Teacher ID is required'),
    sessionId: z.string().min(1, 'Session ID is required')
});

export const submitVoteSchema = z.object({
    pollId: z.string().min(1, 'Poll ID is required'),
    studentId: z.string().min(1, 'Student ID is required'),
    studentName: z.string().min(1, 'Student Name is required'),
    selectedOption: z.string().min(1, 'Option ID is required')
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type SubmitVoteInput = z.infer<typeof submitVoteSchema>;
