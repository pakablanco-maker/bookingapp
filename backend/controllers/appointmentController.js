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
import * as Sentry from '@sentry/node';
import { captureException } from '../config/sentry.js';

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

  // Validation
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
      message: "Please provide all required fields",
    });
  }


  const appointment = await Sentry.startSpan(
    {
      name: "Create Appointment",
      op: "booking.create",
    },
    async () => {

      // Get service
      const service = await Sentry.startSpan(
        {
          name: "Find Service",
          op: "db.service.find",
        },
        async () => {
          return await Service.findById(serviceId);
        }
      );


      if (!service) {
        const error = new Error("Service not found");
        error.statusCode = 404;
        throw error;
      }


      const endTime = addMinutesToTime(
        startTime,
        service.duration
      );


      // Check availability
      const isBooked = await Sentry.startSpan(
        {
          name: "Check Appointment Availability",
          op: "booking.check_availability",
        },
        async () => {
          return await isTimeSlotBooked(
            Appointment,
            businessId,
            serviceId,
            appointmentDate,
            startTime,
            endTime
          );
        }
      );


      if (isBooked) {
        const error = new Error(
          "This time slot is already booked"
        );
        error.statusCode = 400;
        throw error;
      }


      const shortCode = await generateShortCode();


      // Create appointment
      const newAppointment = await Sentry.startSpan(
        {
          name: "Save Appointment",
          op: "db.appointment.create",
        },
        async () => {

          return await Appointment.create({
            businessId,
            serviceId,
            clientName,
            clientPhone,
            clientEmail,
            appointmentDate: new Date(appointmentDate),
            startTime,
            endTime,
            status: "pending",
            shortCode,
          });

        }
      );


      // WhatsApp notification non bloquante
      setImmediate(async () => {

        await Sentry.startSpan(
          {
            name: "Send Owner WhatsApp Alert",
            op: "whatsapp.owner_alert",
          },
          async () => {

            try {

              const formattedDate = formatDate(
                new Date(appointmentDate)
              );


              await sendOwnerPendingAlert(
                businessId.toString(),
                {
                  appointmentId: newAppointment._id,
                  shortCode,
                  clientName,
                  clientPhone,
                  serviceName: service.name,
                  bookingDate: formattedDate,
                  bookingTime: startTime,
                }
              );


            } catch (err) {

              captureException(err, {
                businessId,
                appointmentId: newAppointment._id,
                module: "whatsapp",
              });

            }

          }
        );

      });


      return newAppointment;

    }
  );


  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    data: appointment,
  });

});

// @route   PUT /api/appointments/:id
// @desc    Update appointment status
// @access  Private
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid status' });
  }

  // 1. Récupération initiale
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  // 2. Mise à jour (avec transaction Sentry)
  const tx = Sentry.startSpan({ name: `Update Appointment ${req.params.id} -> ${status}`, op: 'booking.update_status' });
  try {
    const dbSpan = Sentry.startSpan({ name: 'Appointment.findByIdAndUpdate', op: 'db', parentSpan: tx });
    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('serviceId', 'name price').populate('businessId', 'name');
    dbSpan.end();

  // --- DEBUG LOGS (À supprimer après test) ---
  console.log("Nom Client:", appointment.clientName);
  console.log("Tel Client:", appointment.clientPhone);
  // -------------------------------------------

  // --- LOGIQUE D'ENVOI WHATSAPP ---
    if (status === 'confirmed') {
    // On vérifie que le téléphone existe avant d'appeler le service
    if (appointment.clientPhone) {
        // send notification as part of the Sentry transaction
        const notifySpan = Sentry.startSpan({ name: 'sendBookingConfirmation', op: 'notify', parentSpan: tx });
        await sendBookingConfirmation({
          businessId: appointment.businessId?._id || appointment.businessId,
          customerPhone: appointment.clientPhone,
          customerName: appointment.clientName,
          serviceName: appointment.serviceId?.name || 'Service',
          bookingDate: appointment.formattedDate,
          bookingTime: appointment.startTime,
          businessName: appointment.businessId?.name || 'Notre Établissement',
        });
        notifySpan.end();
    } else {
        console.error("Impossible d'envoyer le WhatsApp : clientPhone est manquant.");
    }
  } 
  
  else if (status === 'cancelled') {
    if (appointment.clientPhone) {
        const notifySpan = Sentry.startSpan({ name: 'sendBookingCancellation', op: 'notify', parentSpan: tx });
        await sendBookingCancellation({
          businessId: appointment.businessId?._id || appointment.businessId,
          customerPhone: appointment.clientPhone,
          customerName: appointment.clientName,
          serviceName: appointment.serviceId?.name || 'Service',
          bookingDate: appointment.formattedDate,
          bookingTime: appointment.startTime,
          businessName: appointment.businessId?.name || 'Notre Établissement',
        });
        notifySpan.end();
    }
  }
    tx.end();
  } catch (err) {
    tx.end();
    throw err;
  }

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
