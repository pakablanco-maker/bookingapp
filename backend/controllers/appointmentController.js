import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import {
  isTimeSlotBooked,
  addMinutesToTime,
  formatDate,
} from '../utils/helpers.js';
import { asyncHandler } from '../utils/errorHandler.js';

// @route   GET /api/appointments
// @desc    Get all appointments for authenticated business owner
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({
    businessId: req.userId,
  })
    .populate('serviceId', 'name price duration')
    .sort({ appointmentDate: -1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

// @route   GET /api/appointments/business/today
// @desc    Get today's appointments
// @access  Private
const getTodayAppointments = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointments = await Appointment.find({
    businessId: req.userId,
    appointmentDate: {
      $gte: today,
      $lt: tomorrow,
    },
  })
    .populate('serviceId', 'name price duration')
    .sort({ startTime: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

// @route   GET /api/appointments/business/stats
// @desc    Get appointment statistics
// @access  Private
const getAppointmentStats = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({
    businessId: req.userId,
  });

  const stats = {
    total: appointments.length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @route   GET /api/appointments/available-slots/:businessId/:serviceId/:date
// @desc    Get available time slots for booking
// @access  Public
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { businessId, serviceId, date } = req.params;

  // Get business details
  const business = await User.findById(businessId);
  if (!business) {
    return res.status(404).json({
      success: false,
      message: 'Business not found',
    });
  }

  // Get service details
  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found',
    });
  }

  // Get day of week
  const appointmentDate = new Date(date);
  const dayOfWeek = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ][appointmentDate.getDay()];

  // Get business hours for that day
  const businessHours = business.workingHours?.[dayOfWeek];
  if (!businessHours || !businessHours.start || !businessHours.end) {
    return res.status(200).json({
      success: true,
      slots: [],
      message: 'Business is closed on this day',
    });
  }

  // Get booked appointments for this day
  const bookedAppointments = await Appointment.find({
    businessId,
    appointmentDate: {
      $gte: new Date(date).setHours(0, 0, 0, 0),
      $lt: new Date(date).setHours(23, 59, 59, 999),
    },
    status: { $ne: 'cancelled' },
  });

  // Generate available slots (30-minute intervals)
  const slots = [];
  let currentTime = businessHours.start;

  while (currentTime < businessHours.end) {
    const endTime = addMinutesToTime(currentTime, service.duration);

    // Check if slot overlaps with any booked appointment
    const isBooked = bookedAppointments.some((apt) => {
      return apt.startTime < endTime && apt.endTime > currentTime;
    });

    if (!isBooked && endTime <= businessHours.end) {
      slots.push({
        startTime: currentTime,
        endTime: endTime,
        available: true,
      });
    }

    // Move to next 30-minute slot
    const [hours, minutes] = currentTime.split(':').map(Number);
    let nextMinutes = minutes + 30;
    let nextHours = hours;

    if (nextMinutes >= 60) {
      nextHours += Math.floor(nextMinutes / 60);
      nextMinutes = nextMinutes % 60;
    }

    currentTime = `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
  }

  res.status(200).json({
    success: true,
    slots,
    serviceDuration: service.duration,
  });
});

// @route   POST /api/appointments
// @desc    Create a new appointment (Client booking)
// @access  Public
const createAppointment = asyncHandler(async (req, res) => {
  const { businessId, serviceId, clientName, clientPhone, clientEmail, appointmentDate, startTime } =
    req.body;

  // Validation
  if (!businessId || !serviceId || !clientName || !clientPhone || !appointmentDate || !startTime) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
  }

  // Get service to calculate end time
  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found',
    });
  }

  const endTime = addMinutesToTime(startTime, service.duration);

  // Check for double booking
  const isBooked = await isTimeSlotBooked(
    Appointment,
    businessId,
    serviceId,
    appointmentDate,
    startTime,
    endTime
  );

  if (isBooked) {
    return res.status(400).json({
      success: false,
      message: 'This time slot is already booked',
    });
  }

  // Create appointment
  const appointment = await Appointment.create({
    businessId,
    serviceId,
    clientName,
    clientPhone,
    clientEmail,
    appointmentDate: new Date(appointmentDate),
    startTime,
    endTime,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: appointment,
  });
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment status
// @access  Private
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid status',
    });
  }

  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  // Verify ownership
  if (appointment.businessId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this appointment',
    });
  }

  appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('serviceId', 'name price duration');

  res.status(200).json({
    success: true,
    message: 'Appointment updated successfully',
    data: appointment,
  });
});

// @route   DELETE /api/appointments/:id
// @desc    Delete/Cancel an appointment
// @access  Private
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  // Verify ownership
  if (appointment.businessId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this appointment',
    });
  }

  await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled' });

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully',
  });
});

export {
  getAppointments,
  getTodayAppointments,
  getAppointmentStats,
  getAvailableSlots,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
};
