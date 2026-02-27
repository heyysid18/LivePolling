import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    studentId: string; // generated UUID per tab/client
    studentName: string;
    selectedOption: string;
    createdAt: Date;
}

const VoteSchema: Schema = new Schema({
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
    studentId: { type: String, required: true }, // unique session ID
    studentName: { type: String, required: true },
    selectedOption: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent multiple votes per student per poll
VoteSchema.index({ pollId: 1, studentName: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema);
