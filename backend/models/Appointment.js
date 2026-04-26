import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Business ID is required'],
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required'],
    },
    clientName: {
      type: String,
      required: [true, 'Please provide client name'],
      trim: true,
      maxlength: [100, 'Client name cannot exceed 100 characters'],
    },
    clientPhone: {
      type: String,
      required: [true, 'Please provide client phone'],
      trim: true,
    },
    clientEmail: {
      type: String,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Please provide appointment date'],
    },
    startTime: {
      type: String, // Format: "HH:MM" (e.g., "14:30")
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: String, // Format: "HH:MM" (calculated based on service duration)
      required: [true, 'Please provide end time'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for querying appointments by business and date
appointmentSchema.index({ businessId: 1, appointmentDate: 1 });
appointmentSchema.index({ businessId: 1, status: 1 });

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function () {
  return this.appointmentDate.toLocaleDateString();
});

// Virtual for checking if appointment is in the past
appointmentSchema.virtual('isPast').get(function () {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  const [hours, minutes] = this.startTime.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  return appointmentDateTime < now;
});

// Enable virtuals in toJSON
appointmentSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Appointment', appointmentSchema);
