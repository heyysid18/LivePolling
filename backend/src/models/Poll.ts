import mongoose, { Schema, Document } from 'mongoose';

export interface IPollOption {
    id: string; // client-generated index or UUID
    text: string;
    votes: number;
}

export interface IPoll extends Document {
    question: string;
    options: IPollOption[];
    duration: number; // in seconds
    startTime: Date;
    status: 'active' | 'completed';
    createdBy: string;
    removedStudents: string[];
    sessionId: string;
}

const PollOptionSchema: Schema = new Schema({
    id: { type: String, required: true },
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
}, { _id: false });

const PollSchema: Schema = new Schema({
    question: { type: String, required: true },
    options: { type: [PollOptionSchema], required: true },
    duration: { type: Number, required: true },
    status: { type: String, enum: ['active', 'completed'], default: 'active', index: true },
    startTime: { type: Date, default: Date.now },
    createdBy: { type: String, required: true, index: true },
    removedStudents: { type: [String], default: [] },
    sessionId: { type: String, required: true, index: true }
});

export default mongoose.model<IPoll>('Poll', PollSchema);
