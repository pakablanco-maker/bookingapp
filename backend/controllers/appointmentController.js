import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import {
  isTimeSlotBooked,
  addMinutesToTime,
  formatDate,
} from '../utils/helpers.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { sendBookingConfirmation, sendBookingCancellation, sendOwnerPendingAlert } from '../utils/whatsappService.js';
import { generateShortCode } from '../utils/shortCodeGenerator.js';
import { captureException, startActiveSpan, addBreadcrumb } from '../config/sentry.js';

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
  const {
    businessId,
    serviceId,
    clientName,
    clientPhone,
    clientEmail,
    appointmentDate,
    startTime,
  } = req.body;

  if (
    !businessId ||
    !serviceId ||
    !clientName ||
    !clientPhone ||
    !appointmentDate ||
    !startTime
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
  }

  // Use modern Sentry tracing pattern
  return await startActiveSpan(
    {
      name: 'Create Appointment',
      op: 'booking.create',
      description: `Booking appointment for ${clientName}`,
    },
    async (span) => {
      try {
        // Find service
        const service = await Service.findById(serviceId);

        if (!service) {
          const error = new Error('Service not found');
          error.statusCode = 404;
          throw error;
        }

        const endTime = addMinutesToTime(startTime, service.duration);

        // Check availability
        const isBooked = await isTimeSlotBooked(
          Appointment,
          businessId,
          serviceId,
          appointmentDate,
          startTime,
          endTime
        );

        if (isBooked) {
          const error = new Error('This time slot is already booked');
          error.statusCode = 400;
          throw error;
        }

        const shortCode = await generateShortCode();

        // Save appointment
        const newAppointment = await Appointment.create({
          businessId,
          serviceId,
          clientName,
          clientPhone,
          clientEmail,
          appointmentDate: new Date(appointmentDate),
          startTime,
          endTime,
          status: 'pending',
          shortCode,
        });

        // Add span data for monitoring
        if (span) {
          span.setAttribute('appointment.id', newAppointment._id.toString());
          span.setAttribute('appointment.status', 'pending');
          span.setAttribute('service.duration', service.duration);
        }

        // Send owner alert asynchronously (don't block response)
        setImmediate(async () => {
          try {
            const formattedDate = formatDate(new Date(appointmentDate));

            await sendOwnerPendingAlert(businessId.toString(), {
              appointmentId: newAppointment._id,
              shortCode,
              clientName,
              clientPhone,
              serviceName: service.name,
              bookingDate: formattedDate,
              bookingTime: startTime,
            });
          } catch (err) {
            captureException(err, {
              businessId,
              appointmentId: newAppointment._id,
              module: 'whatsapp.owner_alert',
            });
          }
        });

        // Log success
        addBreadcrumb({
          category: 'booking.create',
          message: `Appointment created: ${shortCode}`,
          level: 'info',
          data: { appointmentId: newAppointment._id.toString() },
        });

        res.status(201).json({
          success: true,
          message: 'Appointment booked successfully',
          data: newAppointment,
        });
      } catch (err) {
        // Error will be automatically captured by Sentry's error handler
        captureException(err, {
          businessId,
          serviceId,
          module: 'appointment.create',
        });
        throw err;
      }
    }
  );
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment status
// @access  Private
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid status' });
  }

  // 1. Initial fetch
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  // Use modern Sentry tracing pattern
  return await startActiveSpan(
    {
      name: 'Update Appointment Status',
      op: 'booking.update_status',
      description: `Update appointment ${req.params.id} to ${status}`,
    },
    async (span) => {
      try {
        appointment = await Appointment.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true, runValidators: true }
        ).populate('serviceId', 'name price').populate('businessId', 'name');

        // Add span data for monitoring
        if (span) {
          span.setAttribute('appointment.id', appointment._id.toString());
          span.setAttribute('appointment.status', status);
        }

        // Send notifications based on status
        if (status === 'confirmed') {
          if (appointment.clientPhone) {
            await sendBookingConfirmation({
              businessId: appointment.businessId?._id || appointment.businessId,
              customerPhone: appointment.clientPhone,
              customerName: appointment.clientName,
              serviceName: appointment.serviceId?.name || 'Service',
              bookingDate: appointment.formattedDate,
              bookingTime: appointment.startTime,
              businessName: appointment.businessId?.name || 'Notre Établissement',
            });
            addBreadcrumb({
              category: 'booking.confirmed',
              message: `Confirmation sent to ${appointment.clientPhone}`,
              level: 'info',
              data: { appointmentId: appointment._id.toString() },
            });
          } else {
            console.error("Cannot send WhatsApp: clientPhone is missing.");
          }
        } else if (status === 'cancelled') {
          if (appointment.clientPhone) {
            await sendBookingCancellation({
              businessId: appointment.businessId?._id || appointment.businessId,
              customerPhone: appointment.clientPhone,
              customerName: appointment.clientName,
              serviceName: appointment.serviceId?.name || 'Service',
              bookingDate: appointment.formattedDate,
              bookingTime: appointment.startTime,
              businessName: appointment.businessId?.name || 'Notre Établissement',
            });
            addBreadcrumb({
              category: 'booking.cancelled',
              message: `Cancellation sent to ${appointment.clientPhone}`,
              level: 'info',
              data: { appointmentId: appointment._id.toString() },
            });
          }
        }

        res.status(200).json({
          success: true,
          message: 'Appointment updated successfully',
          data: appointment,
        });
      } catch (err) {
        // Error will be automatically captured by Sentry's error handler
        captureException(err, {
          appointmentId: req.params.id,
          newStatus: status,
          module: 'appointment.update_status',
        });
        throw err;
      }
    }
  );
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
