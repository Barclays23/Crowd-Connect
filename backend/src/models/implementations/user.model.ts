// src/models/implementations/user.model.ts

import { model, Schema, Document, Types } from "mongoose";
import { HostStatus, UserRole, UserStatus } from "@/constants/roles-and-statuses";



// export interface IUser {
export interface IUserModel {
  _id: Types.ObjectId | string;

  name : string;
  email : string;
  mobile : string;
  password : string;
  profilePic? : string;

  isEmailVerified : boolean;
  isMobileVerified : boolean;

  role : UserRole;
  status : UserStatus;      // ( "inactive" or "pending" if admin creates user and verify/login later)
  isSuperAdmin: boolean;

  // Host application fields
  organizationName? : string;
  registrationNumber? : string;
  businessAddress? : string;
  certificateUrl? : string;
  hostStatus? : HostStatus;
  hostAppliedAt?: Date;
  hostReviewedAt?: Date;
  hostReviewedBy?: Types.ObjectId;
  hostRejectionReason?: string;

  createdAt : Date;
  updatedAt : Date;
}


// export interface IUserModel extends Document, Omit<IUser, "_id"> { }






const userSchema = new Schema<IUserModel>(
// const userSchema = new Schema<IUser>(
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
      // sparse: true,
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
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
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
      type: String,
      enum: Object.values(HostStatus),
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
// const User = model<IUser>("User", userSchema);
export default User;