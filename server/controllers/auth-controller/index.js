const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const registerUser = async (req, res) => {
  try {
    const { userName, userEmail, password, role, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ userEmail }, { userName }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User name or user email already exists",
      });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Generate a unique referral code for the new user
    const newReferralCode = crypto.randomBytes(4).toString("hex");

    const newUser = new User({
      userName,
      userEmail,
      role,
      password: hashPassword,
      referralCode: newReferralCode,
      referredBy: referralCode || null, // Store referral code if provided
    });

    // Check if the referral code exists and update the referrer's data
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });

      if (referrer) {
        referrer.referralCount += 1;
        referrer.referrals.push(newUser._id);
        await referrer.save();
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code",
        });
      }
    }

    // Save the new user
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      referralCode: newUser.referralCode, // Send the generated referral code in response
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};


const loginUser = async (req, res) => {
  const { userEmail, password } = req.body;

  const checkUser = await User.findOne({ userEmail });

  if (!checkUser || !(await bcrypt.compare(password, checkUser.password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const accessToken = jwt.sign(
    {
      _id: checkUser._id,
      userName: checkUser.userName,
      userEmail: checkUser.userEmail,
      role: checkUser.role,
      referralCode: checkUser.referralCode, 
    },
    "JWT_SECRET",
    { expiresIn: "120m" }
  );

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      accessToken,
      user: {
        _id: checkUser._id,
        userName: checkUser.userName,
        userEmail: checkUser.userEmail,
        role: checkUser.role,
        referralCode: checkUser.referralCode,
      },
    },
  });
};

module.exports = { registerUser, loginUser };
