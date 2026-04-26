import Service from '../models/Service.js';
import { asyncHandler } from '../utils/errorHandler.js';



// @route   GET /api/services/business/all
// @desc    Get all services for authenticated business owner
// @access  Private
const getBusinessServices = asyncHandler(async (req, res) => {
 try {
  const myServices = await Service.find({businessId: req.userId })

  res.status(200).json({
    success: true,
    count: myServices.length,
    data: myServices,
  });
 } catch (error) {
  res.status(500).json({
    success: false,
    message: 'Failed to fetch services',
  });
 }
});

// @route   GET /api/services/:businessId
// @desc    Get all services for a business
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const { businessId } = req.params;

  const services = await Service.find({
    businessId,
    isActive: true,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services,
  });
});

// @route   POST /api/services
// @desc    Create a new service
// @access  Private
const createService = asyncHandler(async (req, res) => {
  const { name, description, price, duration, category } = req.body;

  // Validation
  if (!name || !price || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, price, and duration',
    });
  }

  const service = await Service.create({
    businessId: req.userId,
    name,
    description,
    price,
    duration,
    category,
  });

  res.status(201).json({
    success: true,
    message: 'Service created successfully',
    data: service,
  });
});

// @route   PUT /api/services/:id
// @desc    Update a service
// @access  Private
const updateService = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found',
    });
  }

  // Verify ownership
  if (service.businessId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this service',
    });
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Service updated successfully',
    data: service,
  });
});

// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Private
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found',
    });
  }

  // Verify ownership
  if (service.businessId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this service',
    });
  }

  await Service.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Service deleted successfully',
  });
});

export { getServices, getBusinessServices, createService, updateService, deleteService };
