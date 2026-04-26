import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Business ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Please provide a service name'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, 'Please provide duration in minutes'],
      min: [15, 'Duration must be at least 15 minutes'],
    },
    image: {
      type: String, // URL to service image
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: ['hair', 'beauty', 'massage', 'coaching', 'other'],
      default: 'other',
    },
  },
  { timestamps: true }
);

// Index to find services by business
serviceSchema.index({ businessId: 1, isActive: 1 });

export default mongoose.model('Service', serviceSchema);
