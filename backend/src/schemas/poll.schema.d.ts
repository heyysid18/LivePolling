import { z } from 'zod';
export declare const createPollSchema: z.ZodObject<{
    question: z.ZodString;
    options: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
    }, z.core.$strip>>;
    duration: z.ZodNumber;
    createdBy: z.ZodString;
}, z.core.$strip>;
export declare const submitVoteSchema: z.ZodObject<{
    pollId: z.ZodString;
    studentId: z.ZodString;
    studentName: z.ZodString;
    selectedOption: z.ZodString;
}, z.core.$strip>;
export type CreatePollInput = z.infer<typeof createPollSchema>;
export type SubmitVoteInput = z.infer<typeof submitVoteSchema>;
//# sourceMappingURL=poll.schema.d.ts.map