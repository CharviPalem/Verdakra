const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email or username' 
      });
    }

    // Create new user
    user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate a password reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.RESET_PASSWORD_SECRET || 'your_reset_password_secret',
      { expiresIn: '1h' }
    );

    // Save the hashed token to the user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Get the frontend URL from environment variables
    const frontendUrl = process.env.FRONTEND_URL.split(',')[0] || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    // Send email using the email utility
    const emailService = require('../utils/email');
    console.log('Sending password reset email to:', email);
    console.log('Reset URL:', resetUrl);
    console.log('Email configuration:', {
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE,
      user: process.env.EMAIL_USERNAME && process.env.EMAIL_USERNAME.substring(0, 3) + '...',
      from: process.env.EMAIL_FROM
    });
    
    try {
      await emailService.sendPasswordResetEmail(email, resetUrl);
      console.log('Password reset email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Still return success to user for security
    }
    
    // Return success message
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
      resetUrl,
      message
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing password reset request' 
    });
  }
};

// @desc    Verify password reset token
// @route   GET /api/auth/reset-password/:token
// @access  Public
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET || 'your_reset_password_secret');
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if user exists and token is still valid
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      userId: user._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error verifying reset token'
    });
  }
};

// @desc    Complete password reset with new password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.completePasswordReset = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid token and new password'
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET || 'your_reset_password_secret');
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Find the user
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update user's password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};
