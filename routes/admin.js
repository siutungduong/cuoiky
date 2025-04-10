var express = require('express');
var router = express.Router();
const ordersRouter = require('./admin/orders');
const usersRouter = require('./admin/users');

// Trang chủ admin
router.get('/', (req, res) => {
  res.render('admin/home', { title: 'Admin Home' });
});

//Trang khách hàng trong admin
router.get('/customers', (req, res) => {
  res.render('admin/customers', { title: 'Customers' }); 
});

//Trang khuyến mãi trong admin
router.get('/promotion', (req, res) => {
  res.render('admin/promotion', { title: 'Promotions' });
});

//Trang báo cáo trong admin
router.get('/report', (req, res) => {
  res.render('admin/report', { title: 'Reports' });
});


//Trang quản lý trong admin
router.get('/manage', (req, res) => {
  res.render('admin/manage', { title: 'Manage' });
});

router.use('/orders', ordersRouter);
router.use('/users', usersRouter);

module.exports = router;