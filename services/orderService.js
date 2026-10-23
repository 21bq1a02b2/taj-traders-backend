import Order from '../models/Order.js';
import { getIsMongoConnected } from '../config/db.js';

let memoryOrders = [];

export const createOrderService = async (orderData) => {
  if (getIsMongoConnected()) {
    return await Order.create(orderData);
  }

  const newOrder = {
    ...orderData,
    _id: `ord_${Date.now()}`,
    status: orderData.status || 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryOrders.unshift(newOrder);
  return newOrder;
};

export const getAllOrdersService = async () => {
  if (getIsMongoConnected()) {
    return await Order.find().sort({ createdAt: -1 });
  }
  return memoryOrders;
};

export const getOrderByIdService = async (id) => {
  if (getIsMongoConnected()) {
    return await Order.findById(id);
  }
  return memoryOrders.find((o) => String(o._id) === String(id));
};

export const updateOrderStatusService = async (id, status) => {
  if (getIsMongoConnected()) {
    return await Order.findByIdAndUpdate(id, { status }, { new: true });
  }

  const idx = memoryOrders.findIndex((o) => String(o._id) === String(id));
  if (idx === -1) return null;
  memoryOrders[idx].status = status;
  memoryOrders[idx].updatedAt = new Date().toISOString();
  return memoryOrders[idx];
};
