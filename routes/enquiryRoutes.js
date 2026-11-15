import express from 'express';
import {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from '../controllers/enquiryController.js';

const router = express.Router();

// Public: Submit customer lead
router.post('/', createEnquiry);

// Admin: Fetch leads with status/search filter
router.get('/', getEnquiries);

// Admin: Update lead status (New, Contacted, Converted, Not Interested)
router.patch('/:id/status', updateEnquiryStatus);

// Admin: Delete lead
router.delete('/:id', deleteEnquiry);

export default router;
