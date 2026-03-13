import mongoose, { Document, Schema, Model, Types } from "mongoose";
import slugify from "slugify";
import { BlogStatus } from "../types";

export interface IBlog {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  status: BlogStatus;
  author: Types.ObjectId;
  readTime: number;
  views: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type IBlogDocument = IBlog & Document;

export type IBlogModel = Model<IBlogDocument>;

const blogSchema = new Schema<IBlogDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [50, "Content must be at least 50 characters"],
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    coverImage: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags: string[]) => tags.map((t) => t.toLowerCase().trim()),
    },
    status: {
      type: String,
      enum: Object.values(BlogStatus),
      default: BlogStatus.DRAFT,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    readTime: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
      select: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { __v: _v, ...data } = ret;
        return data;
      },
    },
  },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ title: "text", content: "text", excerpt: "text" });

// ─── Hooks ────────────────────────────────────────────────────────────────────
blogSchema.pre("save", async function () {
  // Auto-generate slug
  if (this.isModified("title")) {
    const base = slugify(this.title, { lower: true, strict: true });
    let slug = base;
    let count = 1;
    while (await Blog.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${count++}`;
    }
    this.slug = slug;
  }

  // Calculate read time (~200 words per minute)
  if (this.isModified("content")) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }

  // Set publishedAt when status changes to published
  if (
    this.isModified("status") &&
    this.status === BlogStatus.PUBLISHED &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
});

export const Blog = mongoose.model<IBlogDocument, IBlogModel>(
  "Blog",
  blogSchema,
);
