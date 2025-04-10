const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function generateOrderId() {
  return Math.floor(Math.random() * 10000000000000).toString();
}

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: { type: Schema.Types.ObjectId, ref: 'Product' }, quantity: Number }],
  totalAmount: { type: Number, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  orderId: { type: String, default: generateOrderId },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Đang chờ xử lý', 'Đang xử lý', 'Đang giao hàng', 'Đã hoàn thành', 'Đã hủy'],
    default: 'Đang chờ xử lý'
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;