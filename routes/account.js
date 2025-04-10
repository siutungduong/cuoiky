const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Order = require('../models/Order');
const passport = require('passport'); 
const bcrypt = require('bcryptjs');
const { isAdmin } = require('../middleware');


router.post('/make-admin/:id', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, { isAdmin: true });
    res.json({ message: 'User role updated to admin' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).send('Error updating user role');
  }
});

router.post('/register', async (req, res) => { 
    console.log(req.body);
    const { firstName, lastName, email, password, confirmpassword } = req.body;
    if (!firstName || !lastName || !email || !password || !confirmpassword) {
        return res.render('register', { error: 'Vui lòng điền đầy đủ thông tin' });
    }
    if (password !== confirmpassword) {
        return res.render('register', { error: 'Mật khẩu không khớp, sai' }); 
    }
    try {
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(409).render('register', { error: 'Email đã được đăng ký' }); 
        }
        const salt = await bcrypt.hash(password, 10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });
        await newUser.save();
        req.flash('success', 'Đăng ký thành công! Vui lòng đăng nhập.');
        return res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).render('register', { error: 'Lỗi máy chủ' });  
    }
});


router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).render('login', { error: 'Vui lòng điền đầy đủ thông tin' }); 
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).render('login', { error: 'Email hoặc mật khẩu không hợp lệ' }); 
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).render('login', { error: 'Email hoặc mật khẩu không hợp lệ' });
        }
        req.session.user = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin
        };
        console.log('Session User:', req.session.user);
        req.session.name = user.lastName + " " + user.firstName;
        console.log('Session Name:', req.session.name);
        req.session.save(err => {
            if (err) {
                return res.status(500).send("Lỗi khi lưu session");
            }
            console.log('Đăng nhập thành công:', req.session.user.firstName, req.session.user.lastName);
            return res.redirect("/");
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        return res.status(500).render('login', { error: 'Lỗi máy chủ' }); 
    }
});

router.post('/change-password', async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = req.session.user;
    if (!user) {
        return res.redirect('/login');
    }
    try {
        const currentUser = await User.findOne({ email: user.email });
        if (!currentUser) {
            return res.render('account', { error: 'Người dùng không tồn tại.' });
        }
        const isMatch = await bcrypt.compare(currentPassword, currentUser.password);
        if (!isMatch) {
            return res.render('account', { error: 'Mật khẩu hiện tại không chính xác.' });
        }
        if (newPassword !== confirmNewPassword) {
            return res.render('account', { error: 'Mật khẩu mới và xác nhận không khớp.' });
        }
        if (newPassword.length < 6) {
            return res.render('account', { error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        currentUser.password = hashedPassword;
        await currentUser.save();
        return res.render('account', { success: 'Đổi mật khẩu thành công.', user });
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        return res.render('account', { error: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
    }
});

router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    try {
        const user = req.session.user;
        const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
        res.render('account', { user, orders });
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error);
        res.render('account', { user: req.session.user, error: 'Lỗi khi lấy đơn hàng.' });
    }
});

module.exports = router;
