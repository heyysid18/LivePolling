import mongoose, { Document } from 'mongoose';
export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    studentId: string;
    studentName: string;
    selectedOption: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IVote, {}, {}, {}, mongoose.Document<unknown, {}, IVote, {}, {}> & IVote & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Vote.d.ts.map