const mongoose = require('mongoose');

// Define the Schema for Leads stored in MongoDB Atlas
const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    interest: {
      type: String,
      default: 'General Inquiry',
      trim: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    source: {
      type: String,
      enum: ['brochure_modal', 'contact_form'],
      default: 'brochure_modal',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt dates
    collection: 'Quantum1', // Explicitly store leads inside 'Quantum1' collection
  }
);

// Create the Mongoose Model
const Lead = mongoose.model('Lead', LeadSchema);

module.exports = Lead;
