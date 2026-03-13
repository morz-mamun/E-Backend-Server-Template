import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { UserRole } from "../types";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  refreshToken?: string;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  changedPasswordAfter(jwtIssuedAt: number): boolean;
}

export interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { password: _p, refreshToken: _r, __v: _v, ...data } = ret;
        return data;
      },
    },
  },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });

// ─── Hooks ────────────────────────────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds);
  if (!this.isNew) this.passwordChangedAt = new Date();
});

// ─── Methods ──────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

userSchema.methods.changedPasswordAfter = function (
  jwtIssuedAt: number,
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );
    return jwtIssuedAt < changedTimestamp;
  }
  return false;
};

// ─── Statics ──────────────────────────────────────────────────────────────────
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email, isActive: true }).select(
    "+password +refreshToken",
  );
};

export const User = mongoose.model<IUserDocument, IUserModel>(
  "User",
  userSchema,
);
