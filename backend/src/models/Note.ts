import mongoose, { Document, Schema, Types } from 'mongoose';

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

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Note author is required'],
    },
    collaborators: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret['id'] = ret['_id'];
        delete ret['_id'];
        delete ret['__v'];
        return ret;
      },
    },
  }
);

// Indexes for better query performance
noteSchema.index({ author: 1, createdAt: -1 });
noteSchema.index({ author: 1, isArchived: 1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ category: 1 });
noteSchema.index({ title: 'text', content: 'text' });

// Set lastEditedBy to author when creating a new note
noteSchema.pre('save', function (next) {
  if (this.isNew) {
    this.lastEditedBy = this.author;
  }
  next();
});

export const Note = mongoose.model<INote>('Note', noteSchema);