const mongoose = require("mongoose");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  password: String,
  role: String,
  referralCode: { type: String, unique: true, default: () => crypto.randomBytes(4).toString("hex") },
  referredBy: { type: String, default: null }, // Stores the referrer's code
  referralCount: { type: Number, default: 0 }, // Number of successful referrals
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of referred users
});

module.exports = mongoose.model("User", UserSchema);
