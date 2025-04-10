var express = require('express');
var router = express.Router();
var Product = require('../models/product');
const passport = require('passport');
const flash = require('connect-flash');
const Order = require('../models/Order');

// Trang chủ
router.get('/', async function(req, res, next) {
  try {
    const name = req.session.name || null; 
    const products = await Product.find();
    res.render('index', { title: 'Korea Mart', products, currentPage: 'home', name: name, isAdmin: req.session.user ? req.session.user.isAdmin : false });
  } catch (err) {
    res.status(500).send('Lỗi khi lấy sản phẩm từ cơ sở dữ liệu');
  }
});


router.get('/details/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).send('Không tìm thấy sản phẩm');
    res.render('product_details', { title: 'Chi tiết sản phẩm', product });
  } catch (err) {
    res.status(500).send('Lỗi khi lấy chi tiết sản phẩm');
  }
});


router.get('/website/list_all_product', async function (req, res, next) {
  try {
    const query = req.query.query; 
    const page = parseInt(req.query.page) || 1; 
    const limit = 8; 
    const skip = (page - 1) * limit;
    let searchQuery = {};
    if (query) {
      searchQuery = {
        $or: [
          { name: new RegExp(query, 'i') }, 
          { type: new RegExp(query, 'i') }, 
          { brand: new RegExp(query, 'i') }, 
          { productCode: new RegExp(query, 'i') },
          { price: isNaN(query) ? undefined : parseFloat(query) }, 
        ],
      };
    }
    const products = await Product.find(searchQuery).skip(skip).limit(limit);
    const totalProducts = await Product.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalProducts / limit);
    res.render('website/list_all_product', {
      title: 'Tất cả sản phẩm',
      products,
      currentPage: 'all-products',
      page,
      totalPages,
      query,
    });
  } catch (err) {
    console.error('Lỗi trong quá trình tìm kiếm sản phẩm:', err);
    res.status(500).send('Lỗi tìm kiếm sản phẩm');
  }
});


router.get("/login", (req, res) => {
  const error = req.flash('error'); 
  if (req.user) {
      return res.redirect("/"); 
  } 
  return res.render("login", { error: error }); 
});


router.get("/register", (req, res) => {
  if (req.user) {
      return res.redirect("/");
  }
  return res.render("register", { error: null });
});


router.get("/logout", (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).send("Lỗi khi đăng xuất");
      }
      res.redirect("/");
  });
});

router.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  let totalAmount = 0;
  cart.forEach(item => {
    totalAmount += item.quantity * item.product.price;
  });
  res.render('cart', { title: 'Giỏ hàng', cart, totalAmount });
});


router.post('/cart/add/:id', async (req, res) => {
  const productId = req.params.id;
  const cart = req.session.cart || [];
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  }
  const existingItem = cart.find(item => item.product._id.toString() === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ product, quantity: 1 });
  }
  req.session.cart = cart;
  res.json({ message: 'Sản phẩm đã được thêm vào giỏ hàng', cart });
});


router.post('/cart/:action/:id', (req, res) => {
  const productId = req.params.id;
  const { action } = req.params;
  const cart = req.session.cart || [];
  if (action === 'update') {
    const { updateAction } = req.body;
    const item = cart.find(item => item.product._id.toString() === productId);
    if (item) {
      if (updateAction === 'increase') {
        item.quantity += 1;
      } else if (updateAction === 'decrease' && item.quantity > 1) {
        item.quantity -= 1;
      }
    }
  } else if (action === 'remove') {
    const updatedCart = cart.filter(item => item.product._id.toString() !== productId);
    req.session.cart = updatedCart;
  }
  req.session.cart = cart;
  res.json({ message: 'Giỏ hàng đã được cập nhật', cart });
});


router.get('/checkout', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const cart = req.session.cart || [];
  const cartTotalAmount = cart.reduce((total, item) => total + item.quantity * item.product.price, 0);
  res.render('checkout', { title: 'Thanh toán', user: req.session.user, cart, cartTotalAmount });
});


router.post('/place-order', async (req, res) => {
  const { phone, address } = req.body;
  const user = req.session.user;
  const cart = req.session.cart || [];
  if (!user || cart.length === 0) {
    return res.redirect('/cart');
  }
  const order = new Order({
    user: user._id,
    items: cart.map(item => ({ product: item.product._id, quantity: item.quantity })),
    totalAmount: cart.reduce((total, item) => total + item.quantity * item.product.price, 0),
    phone,
    address
  });
  try {
    await order.save();
    req.session.cart = [];
    res.redirect(`/order-success/${order._id}`);
  } catch (error) {
    console.error('Lỗi khi đặt hàng:', error);
    res.status(500).send('Lỗi khi đặt hàng');
  }
});

router.get('/order-success/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user');
    res.render('order_success', { title: 'Đặt hàng thành công', order });
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng:', error);
    res.status(500).send('Lỗi khi lấy đơn hàng');
  }
});

router.get('/order-details/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user').populate('items.product');
    if (!order) return res.status(404).send('Không tìm thấy đơn hàng');
    res.render('order_details', { title: 'Chi tiết đơn hàng', order, user: order.user });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    res.status(500).send('Lỗi khi lấy chi tiết đơn hàng');
  }
});


router.post('/order/cancel/:id', async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: 'Đã hủy' });
    res.json({ message: 'Đơn hàng đã được hủy thành công' });
  } catch (error) {
    console.error('Lỗi khi hủy đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi khi hủy đơn hàng' });
  }
});


router.post('/order/reorder/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).send('Không tìm thấy đơn hàng');
    req.session.cart = order.items.map(item => ({
      product: item.product,
      quantity: item.quantity
    }));
    res.json({ message: 'Đơn hàng đã được thêm vào giỏ hàng, chuyển hướng đến trang thanh toán' });
  } catch (error) {
    console.error('Lỗi khi đặt lại đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi khi đặt lại đơn hàng' });
  }
});


router.post('/order/return/:id', async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: 'Đang xử lý hoàn trả' });
    res.json({ message: 'Đã bắt đầu xử lý hoàn trả đơn hàng thành công' });
    setTimeout(async () => {
      await Order.findByIdAndUpdate(req.params.id, { status: 'Đã hoàn trả' });
    }, 60000);
  } catch (error) {
    console.error('Lỗi khi hoàn trả đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi khi hoàn trả đơn hàng' });
  }
});

module.exports = router;