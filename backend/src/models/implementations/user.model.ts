// src/models/implementations/user.model.ts

import { model, Schema, Document, Types } from "mongoose";




export interface IUser {
  _id: Types.ObjectId | string;

  name : string;
  email : string;
  mobile : string;
  password : string;
  profilePic? : string;

  isEmailVerified : boolean;
  isMobileVerified : boolean;

  role: 'user' | 'host' | 'admin';
  status : "active" | "blocked" | "pending";    // ( "inactive" or "pending" if admin creates user and verify/login later)

  // Host application fields
  organizationName? : string;
  registrationNumber? : string;
  businessAddress? : string;
  certificateUrl? : string;

  hostStatus? : 'pending' | 'approved' | 'rejected' | 'blocked';
  hostAppliedAt?: Date;
  hostReviewedAt?: Date;
  hostReviewedBy?: Types.ObjectId;
  hostRejectionReason?: string;

  createdAt : Date;
  updatedAt : Date;
}


export interface IUserModel extends Document, Omit<IUser, "_id"> { }






const userSchema = new Schema<IUserModel>(
  {
    // _id: Types.ObjectId,
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: false,
      // unique: true,
    },
    password: {
      type: String,
      // select: false,  // This prevents the password hash from being sent out accidentally when using standard Mongoose queries (.find(), .findOne(), etc.).
    },
    profilePic: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isMobileVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ["user", "host", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "blocked", "pending"],
      default: "pending",
    },


    organizationName: {
      type: String,
    },
    registrationNumber: {
      type: String,
    },
    businessAddress: {
      type: String,
    },
    certificateUrl: {
      type: String,
    },
    hostStatus: {
      enum: ["pending", "approved", "rejected", "blocked"],
    },
    hostAppliedAt: {
      type: Date,
    },
    hostReviewedAt: {
      type: Date,
    },
    hostReviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    hostRejectionReason: {
      type: String,
    },

  },
  {
    timestamps: true,
  }
);


// add this partial unique index to avoid duplicate null values
userSchema.index(
  { mobile: 1 },
  { unique: true, partialFilterExpression: { mobile: { $type: "string" } } }
);




const User = model<IUserModel>("User", userSchema);
export default User;