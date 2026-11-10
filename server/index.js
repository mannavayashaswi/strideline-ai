
import "dotenv/config";
import dns from "node:dns";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import auth from "./middleware/auth.js";
import Booking from "./models/Booking.js";
import User from "./models/User.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const emailPattern = /^\S+@\S+\.\S+$/;
const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < new Date().toISOString().slice(0, 10)) {
    return false;
  }
  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
};

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("This website is not allowed to access the API."));
  }
}));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    ok: connected,
    database: connected ? "connected" : "disconnected"
  });
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (
      typeof name !== "string" || name.trim().length < 3 ||
      typeof email !== "string" || !emailPattern.test(email.trim()) ||
      typeof password !== "string" || password.length < 8 || password.length > 72
    ) {
      return res.status(400).json({
        message: "Enter a valid name and email, and a password between 8 and 72 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12)
    });
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This email is already registered." });
    }
    return next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Enter your email and password." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    return res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/auth/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("_id name email createdAt");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/bookings", auth, async (req, res, next) => {
  try {
    const fields = ["model", "colour", "name", "mobile", "email", "pin", "city", "branch", "date", "slot"];
    const values = {};
    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value !== "string" || !value.trim()) {
        return res.status(400).json({ message: `Please provide ${field}.` });
      }
      values[field] = value.trim();
    }

    if (req.body.agree !== true) {
      return res.status(400).json({ message: "Please accept the enquiry declaration." });
    }
    if (!/^[6-9]\d{9}$/.test(values.mobile)) {
      return res.status(400).json({ message: "Enter a valid 10-digit Indian mobile number." });
    }
    if (!emailPattern.test(values.email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (!/^\d{6}$/.test(values.pin)) {
      return res.status(400).json({ message: "Enter a valid 6-digit PIN code." });
    }
    if (!validDate(values.date)) {
      return res.status(400).json({ message: "Choose a valid visit date." });
    }

    const booking = await Booking.create({
      ...values,
      email: values.email.toLowerCase(),
      userId: req.user.id,
      reference: `CR-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`
    });
    return res.status(201).json({
      message: "Booking enquiry saved successfully.",
      booking: {
        _id: booking._id,
        reference: booking.reference,
        status: booking.status,
        createdAt: booking.createdAt,
        ...Object.fromEntries(fields.map((field) => [field, booking[field]]))
      }
    });
  } catch (error) {
    return next(error);
  }
});

app.use("/api", (_req, res) => res.status(404).json({ message: "API route not found." }));
app.use((error, _req, res, _next) => {
  console.error("API error:", error.message);
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: "Some submitted details are invalid." });
  }
  if (error.message?.includes("not allowed to access")) {
    return res.status(403).json({ message: error.message });
  }
  return res.status(500).json({ message: "Server error. Please try again later." });
});

async function startServer() {
  if (!process.env.MONGODB_URI || !JWT_SECRET || JWT_SECRET.startsWith("replace-with-")) {
    console.error("MONGODB_URI and JWT_SECRET must be set to your private values in .env.");
    process.exit(1);
  }

  try {
    const dnsServers = process.env.DNS_SERVERS
      ?.split(",")
      .map((server) => server.trim())
      .filter(Boolean);
    if (dnsServers?.length) dns.setServers(dnsServers);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connection established successfully.");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Classic Rides API listening on port ${PORT}.`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
