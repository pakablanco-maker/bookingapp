import User from '../models/User.js';
import { generateToken } from '../utils/helpers.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

// Helper function to generate slug
const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/^-+|-+$/g, '');
};

// @route   POST /api/auth/register
// @desc    Register a new business owner
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, businessName, phone } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password',
    });
  }

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email',
    });
  }

  // Generate slug from business name or user name
  const slugBase = slugify(businessName || name);
  let slug = slugBase;
  let counter = 1;

  // Ensure slug is unique
  while (await User.findOne({ slug })) {
    slug = `${slugBase}-${counter}`;
    counter++;
  }

  // Create user
  user = await User.create({
    name,
    email,
    password,
    businessName,
    phone,
    slug,
  });

  // Generate token
  const token = generateToken(user._id, 'business');

  // Remove password from response
  const userResponse = user.toJSON();

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: userResponse,
  });
});

// @route   POST /api/auth/login
// @desc    Login business owner
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  // Check for user (select password since it's not selected by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Check password
  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Generate token
  const token = generateToken(user._id, 'business');

  const userResponse = user.toJSON();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: userResponse,
  });
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, businessName, phone, address, city, businessDescription } =
    req.body;

  const user = await User.findByIdAndUpdate(
    req.userId,
    {
      name,
      businessName,
      phone,
      address,
      city,
      businessDescription,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated',
    user,
  });
});

// @route   GET /api/auth/public/:slug
// @desc    Get public business data by slug
// @access  Public
const getPublicBusinessData = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // Find user by slug
  const user = await User.findOne({ slug });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Business not found',
    });
  }

  // Get services for this business
  const Service = (await import('../models/Service.js')).default;
  const services = await Service.find({ businessId: user._id });

  res.status(200).json({
    success: true,
    business: {
      _id: user._id,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      businessDescription: user.businessDescription,
      phone: user.phone,
      address: user.address,
      city: user.city,
      businessImage: user.businessImage,
      workingHours: user.workingHours,
    },
    services,
  });
});

// @route   PUT /api/auth/working-hours
// @desc    Update business working hours
// @access  Private
const updateWorkingHours = asyncHandler(async (req, res) => {
  const { workingHours } = req.body;

  // Validate working hours format
  if (!workingHours) {
    return res.status(400).json({
      success: false,
      message: 'Please provide working hours',
    });
  }

  // Valid days
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Validate that only valid days are provided
  for (const day of Object.keys(workingHours)) {
    if (!validDays.includes(day.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid day: ${day}`,
      });
    }

    // Validate time format (HH:MM)
    if (workingHours[day].start && !workingHours[day].start.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return res.status(400).json({
        success: false,
        message: `Invalid start time format for ${day}. Use HH:MM format`,
      });
    }

    if (workingHours[day].end && !workingHours[day].end.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return res.status(400).json({
        success: false,
        message: `Invalid end time format for ${day}. Use HH:MM format`,
      });
    }
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { workingHours },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Working hours updated successfully',
    user,
  });
});

export { register, login, getProfile, updateProfile, getPublicBusinessData, updateWorkingHours };
