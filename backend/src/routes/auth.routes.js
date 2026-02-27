const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const { authenticate } = require("../middleware/auth.middleware");

const { sendMail, generateOtpEmail } = require("../utils/mailer");

const router = express.Router();


// TEMP STORE — user is saved here until OTP is verified
const pendingRegistrations = new Map();

/* ============================================================================
   1️⃣ REGISTER — SEND OTP (DO NOT CREATE DATABASE USER HERE)
============================================================================ */
router.post(
  "/register-otp",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("firstName").trim().notEmpty(),
    body("lastName").trim().notEmpty(),
    body("role").isIn(["patient", "doctor"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const {
        email,
        password,
        firstName,
        lastName,
        role,
        phone,
        specialization,
      } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "User already exists" });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000;

      pendingRegistrations.set(email, {
        email,
        password,
        firstName,
        lastName,
        role,
        phone,
        specialization,
        otp,
        otpExpires,
      });

      await sendMail(
        email,
        "Email Verification - Integrated Health Care",
        generateOtpEmail(firstName, otp),
        `Your OTP is ${otp}`
      );

      return res.status(200).json({
        message: "OTP sent successfully. Please check your email.",
      });
    } catch (err) {
      console.error("register-otp error:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/* ============================================================================
   2️⃣ VERIFY OTP — CREATE USER AFTER CORRECT OTP
============================================================================ */
router.post(
  "/verify-otp",
  [
    body("email").isEmail().normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }),
  ],
  async (req, res) => {
    try {
      const { email, otp } = req.body;

      const pending = pendingRegistrations.get(email);

      if (!pending)
        return res.status(400).json({
          message: "No pending registration found. Please register again.",
        });

      if (Date.now() > pending.otpExpires) {
        pendingRegistrations.delete(email);
        return res.status(400).json({ message: "OTP expired" });
      }

      if (pending.otp !== otp)
        return res.status(400).json({ message: "Invalid OTP" });

      // FIX: HASH PASSWORD HERE
      const hashedPassword = await bcrypt.hash(pending.password, 10);

      const isDoctor = pending.role === "doctor";

      const newUser = new User({
        email: pending.email,
        password: hashedPassword,
        profile: {
          firstName: pending.firstName,
          lastName: pending.lastName,
          phone: pending.phone,
        },
        role: pending.role,
        // Patients are active immediately, doctors require admin approval
        status: isDoctor ? "pending" : "active",
        isActive: !isDoctor,
        isVerified: true,

        ...(isDoctor && {
          doctorInfo: { specialization: pending.specialization || "" },
        }),

        ...(!isDoctor && {
          patientInfo: { allergies: [] },
        }),
      });

      await newUser.save();

      pendingRegistrations.delete(email);

      const token = jwt.sign(
        {
          userId: newUser._id.toString(),
          email: newUser.email,
          role: newUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Account verified successfully",
        token,
        user: newUser,
      });
    } catch (err) {
      console.error("verify-otp error:", err);
      return res.status(500).json({
        message: "OTP verification failed",
        error: err.message,
      });
    }
  }
);

/* ============================================================================
   3️⃣ LOGIN — MUST BE VERIFIED BEFORE LOGIN
============================================================================ */
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid email or password" });

      if (!user.isVerified)
        return res.status(400).json({ message: "Please verify email first" });

      // Prevent doctors from logging in until admin approval
      if (user.role === "doctor" && user.status !== "active") {
        return res.status(403).json({
          message: "Your account is under review. Please wait for admin approval.",
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);
// GET CURRENT LOGGED IN USER
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Auth /me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


/* ============================================================================
   4️⃣ GOOGLE LOGIN
============================================================================ */
router.post(
  "/google",
  async (req, res) => {
    try {
      const { accessToken } = req.body;

      if (!accessToken) {
        return res.status(400).json({ message: "Google access token required" });
      }

      // Verify token/fetch user info from Google
      // We can use simple fetch here instead of full library to reduce complexity if we just need user profile
      const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      });

      if (!googleResponse.ok) {
        return res.status(400).json({ message: "Invalid Google token" });
      }

      const googleUser = await googleResponse.json();
      const { email, id, given_name, family_name, picture } = googleUser;

      // Check if user exists
      let user = await User.findOne({ email });

      if (user) {
        // Link googleId if not linked
        if (!user.googleId) {
          user.googleId = id;
          user.authProvider = user.authProvider === 'local' ? user.authProvider : 'google';
          // If user has a profile picture from Google and none in DB, update it
          if (!user.profile.profilePicture && picture) {
            user.profile.profilePicture = picture;
          }
          await user.save();
        }
      } else {
        // Create new user
        user = new User({
          email,
          googleId: id,
          authProvider: 'google',
          profile: {
            firstName: given_name || 'User',
            lastName: family_name || '',
            profilePicture: picture
          },
          role: 'patient', // Default role for social login
          status: 'active',
          isActive: true, // Google users are auto-activated
          isVerified: true // Google users are auto-verified
        });
        await user.save();
      }

      // Generate Token
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Google Login successful",
        token,
        user,
      });

    } catch (err) {
      console.error("Google Auth Error:", err);
      return res.status(500).json({ message: "Google Authentication failed", error: err.message });
    }
  }
);


module.exports = router;
