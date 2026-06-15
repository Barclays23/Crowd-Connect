// src/models/implementations/user.model.ts

import { model, Schema } from "mongoose";
import { 
  HostStatus, 
  UserRole, 
  UserStatus 
} from "@/constants/roles-and-statuses";
import { AuthProvider, IUserModel } from "@/types/user.types";




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
      // sparse: true,
    },
    password: {
      type: String,
      required: false, // false for Google Auth users
    },
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    profilePic: {
      type: String,
    },
    walletBalance: { 
      type: Number, 
      default: 0, 
      min: 0 
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