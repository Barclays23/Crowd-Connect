// src/models/implementations/user.model.ts

import { model, Schema, Document, Types } from "mongoose";
import { hashPassword } from "../../utils/bcrypt.utils";
import { IUser } from "@shared/types";  // shared/types/index.ts



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
      enum: ["active", "blocked"],
      default: "active",
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
    certificate: {
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


// pre save the hashed password before saving the document in DB.
// userSchema.pre<IUserModel>("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await hashPassword(this.password)
//   }
//   next()
// })


const User = model<IUserModel>("User", userSchema);
export default User;