import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    model: {
      type: String,
      required: true
    },

    colour: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    mobile: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    pin: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    branch: {
      type: String,
      required: true
    },

    date: {
      type: String,
      required: true
    },

    slot: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending"],
      default: "pending"
    }
  },
  { timestamps: true, collection: "bookings" }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;