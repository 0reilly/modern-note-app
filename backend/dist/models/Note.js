"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const noteSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Note author is required'],
    },
    collaborators: [{
            type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    version: {
        type: Number,
        default: 1,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret['id'] = ret['_id'];
            delete ret['_id'];
            delete ret['__v'];
            return ret;
        },
    },
});
noteSchema.index({ author: 1, createdAt: -1 });
noteSchema.index({ author: 1, isArchived: 1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ category: 1 });
noteSchema.index({ title: 'text', content: 'text' });
noteSchema.pre('save', function (next) {
    if (this.isNew) {
        this.lastEditedBy = this.author;
    }
    next();
});
exports.Note = mongoose_1.default.model('Note', noteSchema);
