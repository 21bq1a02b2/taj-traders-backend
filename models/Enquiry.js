import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    product: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: String,
      trim: true,
      default: '1',
    },
    location: {
      type: String,
      trim: true,
      default: 'Hyderabad',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['Quote Request', 'Product Enquiry', 'Bulk Order', 'General Contact'],
      default: 'General Contact',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Converted', 'Not Interested'],
      default: 'New',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);

export default Enquiry;
