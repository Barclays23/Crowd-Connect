const mongoose = require("mongoose");

import { model, Schema, Document, Types } from "mongoose";


const eventSchema = new mongoose.Schema(
  {
    // --- Basic Info ---
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Concerts & Music",
        "Theatre & Arts",
        "Education & Workshops",
        "Conferences & Seminars",
        "Sports & Fitness",
        "Food & Drink",
        "Parties & Nightlife",
        "Business & Networking",
        "Weddings & Social Gatherings",
        "Festivals & Fairs",
        "Travel & Outdoor",
        "Spiritual & Religious",
        "Technology & Innovation",
        "Kids & Family",
        "Charity & Causes",
        "Film & Media",
      ],
    },
    banner: {
      type: String, // Store the Cloudinary/S3 URL here
      required: true,
    },
    hostRef: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },

    // --- 1. Event Format (Online vs In-Person) ---
    eventFormat: {
      type: String,
      enum: ["OFFLINE", "ONLINE"],
      default: "OFFLINE",
      required: true,
    },

    // --- 2. Location (Hybrid Approach) ---
    // Human Readable Address (e.g., "Bangalore, Karnataka")
    locationName: {
      type: String,
      required: function () {
        return this.format === "OFFLINE"; // Only required if In-Person
      },
    },
    // GeoJSON for Map Searches (Radius filters)
    locationCoordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [Longitude, Latitude]
        index: "2dsphere", // Crucial for geospatial queries
      },
    },

    // --- 3. Date & Time ---
    startDateTime: {
      type: Date,
      required: true
    },
    endDateTime: {
      type: Date,
      required: true
    },

    // --- 4. Ticket Type & Pricing ---
    ticketType: {
      type: String,
      enum: ["FREE", "PAID"],
      default: "PAID",
      required: true,
    },
    ticketPrice: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
      required: function () {
        return this.ticketType === "PAID";
      },
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    
    // --- Management Fields ---
    isPublished: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);




// Indexes for faster searching
eventSchema.index({ title: "text", description: "text" }); // For keyword search
eventSchema.index({ startDateTime: 1 }); // For sorting by date
eventSchema.index({ host: 1 }); // For finding events by a specific host




module.exports = mongoose.model("Event", eventSchema);