import mongoose, { Document } from 'mongoose';
export interface IPollOption {
    id: string;
    text: string;
    votes: number;
}
export interface IPoll extends Document {
    question: string;
    options: IPollOption[];
    duration: number;
    startTime: Date;
    status: 'active' | 'completed';
    createdBy: string;
}
declare const _default: mongoose.Model<IPoll, {}, {}, {}, mongoose.Document<unknown, {}, IPoll, {}, {}> & IPoll & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Poll.d.ts.map