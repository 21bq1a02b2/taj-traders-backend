import Enquiry from '../models/Enquiry.js';
import { getIsMongoConnected } from '../config/db.js';

// In-memory fallback for local dev when MongoDB Atlas is offline
let memoryEnquiries = [];

export const createEnquiry = async (req, res) => {
  try {
    const { name, phone, email, product, quantity, location, message, type } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required',
      });
    }

    const enquiryData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      product: product ? product.trim() : '',
      quantity: quantity ? String(quantity).trim() : '1',
      location: location ? location.trim() : 'Hyderabad',
      message: message ? message.trim() : '',
      type: type || 'General Contact',
      status: 'New',
      notes: '',
    };

    if (getIsMongoConnected()) {
      const newEnquiry = await Enquiry.create(enquiryData);
      return res.status(201).json({
        success: true,
        message: 'Enquiry submitted successfully',
        data: newEnquiry,
      });
    }

    const fallbackEnquiry = {
      ...enquiryData,
      _id: `enq_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryEnquiries.unshift(fallbackEnquiry);

    return res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: fallbackEnquiry,
    });
  } catch (error) {
    console.error('Create enquiry error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit enquiry',
    });
  }
};

export const getEnquiries = async (req, res) => {
  try {
    const { status, search } = req.query;

    if (getIsMongoConnected()) {
      const filter = {};
      if (status && status !== 'All') {
        filter.status = status;
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { product: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }

      const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: enquiries.length,
        data: enquiries,
      });
    }

    let filtered = [...memoryEnquiries];
    if (status && status !== 'All') {
      filtered = filtered.filter((e) => e.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.phone?.includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.product?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error('Get enquiries error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch enquiries',
    });
  }
};

export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['New', 'Contacted', 'Converted', 'Not Interested'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    if (getIsMongoConnected()) {
      const updatePayload = {};
      if (status) updatePayload.status = status;
      if (notes !== undefined) updatePayload.notes = notes;

      const updated = await Enquiry.findByIdAndUpdate(id, updatePayload, {
        new: true,
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Enquiry not found' });
      }
      return res.json({ success: true, data: updated });
    }

    const index = memoryEnquiries.findIndex((e) => e._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (status) memoryEnquiries[index].status = status;
    if (notes !== undefined) memoryEnquiries[index].notes = notes;
    memoryEnquiries[index].updatedAt = new Date().toISOString();

    return res.json({ success: true, data: memoryEnquiries[index] });
  } catch (error) {
    console.error('Update enquiry status error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update enquiry status',
    });
  }
};

export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsMongoConnected()) {
      const deleted = await Enquiry.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Enquiry not found' });
      }
      return res.json({ success: true, message: 'Enquiry removed successfully' });
    }

    const prevLength = memoryEnquiries.length;
    memoryEnquiries = memoryEnquiries.filter((e) => e._id !== id);
    if (memoryEnquiries.length === prevLength) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    return res.json({ success: true, message: 'Enquiry removed successfully' });
  } catch (error) {
    console.error('Delete enquiry error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete enquiry',
    });
  }
};
