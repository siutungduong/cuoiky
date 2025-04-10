const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const { isAdmin } = require('../../middleware');

router.use(isAdmin);

router.get('/', async (req, res) => {
  try {
    const { search, searchField } = req.query; 
    let query = {};
    if (search) {
      switch (searchField) {
        case 'orderId':
          query.orderId = new RegExp(search, 'i');
          break;
        case 'createdAt':
          query.createdAt = { $gte: new Date(search) };
          break;
        case 'address':
          query.address = new RegExp(search, 'i'); 
          break;
        case 'status':
          query.status = search;
          break;
        default:
          break;
      }
    }
    const orders = await Order.find(query).populate('user');
    res.render('admin/orders/index', { title: 'Quản lý đơn hàng', orders });
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng:', error);
    res.status(500).send('Lỗi khi lấy đơn hàng');
  }
});

router.post('/order/update/:id', async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  try {
    await Order.findByIdAndUpdate(orderId, { status });
    req.flash('successMessage', `Trạng thái đơn hàng đã được cập nhật thành ${status}`);
    res.redirect('/admin/orders');
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    res.status(500).send('Lỗi khi cập nhật trạng thái đơn hàng');
  }
});

router.post('/order/:action/:id', async (req, res) => {
  const orderId = req.params.id;
  const { action } = req.params;
  try {
    if (action === 'update') {
      const { status } = req.body;
      await Order.findByIdAndUpdate(orderId, { status });
      req.flash('successMessage', `Trạng thái đơn hàng đã được cập nhật thành ${status}`);
    } else if (action === 'cancel') {
      await Order.findByIdAndUpdate(orderId, { status: 'Đã hủy' });
    } else if (action === 'reorder') {
      const order = await Order.findById(orderId).populate('items.product');
      if (!order) return res.status(404).send('Không tìm thấy đơn hàng');
      req.session.cart = order.items.map(item => ({
        product: item.product,
        quantity: item.quantity
      }));
      res.json({ message: 'Đơn hàng đã được thêm vào giỏ hàng, chuyển hướng đến trang thanh toán' });
    } else if (action === 'return') {
      await Order.findByIdAndUpdate(orderId, { status: 'Đang xử lý hoàn trả' });
      setTimeout(async () => {
        await Order.findByIdAndUpdate(orderId, { status: 'Đã hoàn trả' });
      }, 60000);
    }
    res.redirect('/admin/orders');
  } catch (error) {
    console.error('Lỗi khi xử lý đơn hàng:', error);
    res.status(500).send('Lỗi khi xử lý đơn hàng');
  }
});

module.exports = router;