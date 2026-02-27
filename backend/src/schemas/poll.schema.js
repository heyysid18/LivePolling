"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitVoteSchema = exports.createPollSchema = void 0;
const zod_1 = require("zod");
exports.createPollSchema = zod_1.z.object({
    question: zod_1.z.string().min(1, 'Question is required').max(500, 'Question is too long'),
    options: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().min(1, 'Option ID is required'),
        text: zod_1.z.string().min(1, 'Option text is required')
    })).min(2, 'At least 2 options are required').max(10, 'Maximum 10 options allowed'),
    duration: zod_1.z.number().int().min(10, 'Timer must be at least 10 seconds').max(600, 'Timer must be at most 10 minutes'),
    createdBy: zod_1.z.string().min(1, 'Teacher ID is required')
});
exports.submitVoteSchema = zod_1.z.object({
    pollId: zod_1.z.string().min(1, 'Poll ID is required'),
    studentId: zod_1.z.string().min(1, 'Student ID is required'),
    studentName: zod_1.z.string().min(1, 'Student Name is required'),
    selectedOption: zod_1.z.string().min(1, 'Option ID is required')
});
//# sourceMappingURL=poll.schema.js.map