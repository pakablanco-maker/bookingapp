import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id, role = 'business') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  });
};

// Parse time string (HH:MM) to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Add minutes to time string (HH:MM)
const addMinutesToTime = (timeStr, durationMinutes) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes + durationMinutes;
  
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

// Generate available time slots for a day
const generateTimeSlots = (
  businessHours,
  slotDuration = 30,
  bookedSlots = []
) => {
  const slots = [];
  const [startStr, endStr] = businessHours;
  
  let currentTime = startStr;
  
  while (currentTime < endStr) {
    const nextTime = addMinutesToTime(currentTime, slotDuration);
    
    // Check if slot is already booked
    const isBooked = bookedSlots.some(
      (slot) => slot.startTime === currentTime && slot.endTime === nextTime
    );
    
    if (!isBooked) {
      slots.push({
        startTime: currentTime,
        endTime: nextTime,
        available: true,
      });
    }
    
    currentTime = nextTime;
  }
  
  return slots;
};

// Check for double booking
const isTimeSlotBooked = async (
  appointmentModel,
  businessId,
  serviceId,
  appointmentDate,
  startTime,
  endTime
) => {
  const conflictingAppointment = await appointmentModel.findOne({
    businessId,
    appointmentDate: {
      $gte: new Date(appointmentDate).setHours(0, 0, 0, 0),
      $lt: new Date(appointmentDate).setHours(23, 59, 59, 999),
    },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    status: { $ne: 'cancelled' },
  });
  
  return !!conflictingAppointment;
};

// Format date to YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export {
  generateToken,
  timeToMinutes,
  addMinutesToTime,
  generateTimeSlots,
  isTimeSlotBooked,
  formatDate,
};
