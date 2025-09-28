import mongoose, { Document, Types } from 'mongoose';
export interface INote extends Document {
    title: string;
    content: string;
    author: Types.ObjectId;
    collaborators: Types.ObjectId[];
    tags: string[];
    category: string;
    isPublic: boolean;
    isArchived: boolean;
    lastEditedBy: Types.ObjectId;
    version: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Note: mongoose.Model<INote, {}, {}, {}, mongoose.Document<unknown, {}, INote> & INote & {
    _id: Types.ObjectId;
}, any>;
//# sourceMappingURL=Note.d.ts.map