import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
    pollId: string;
    senderName: string;
    senderRole: 'teacher' | 'student';
    message: string;
    createdAt: Date;
}

const chatSchema = new Schema<IChat>(
    {
        pollId: { type: String, required: true, index: true },
        senderName: { type: String, required: true },
        senderRole: { type: String, enum: ['teacher', 'student'], required: true },
        message: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IChat>('Chat', chatSchema);
