var createError = require('http-errors');
var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
var logger = require('morgan');
require('dotenv').config();
const connectDB = require('./models/mongodb.js');
const User = require('./models/user');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

// Lấy URI kết nối từ .env
// var mongoDB = process.env.MONGODB_URI;

// mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log("MongoDB connection error: ", err));

var port = 5555;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// admin
var adminRouter = require('./routes/admin');
var adminproductsRouter = require('./routes/products');
var adminOrdersRouter = require('./routes/admin/orders');
var adminUsersRouter = require('./routes/admin/users');
// account
var accountRouter = require('./routes/account');

var app = express();
connectDB();

// Cấu hình view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Cấu hình phiên làm việc 
app.use(
  session({
    secret: "XiaoYiXian1205XiaoFan1004", // key bí mật
    resave: false, // không lưu lại phiên làm việc nếu không có thay đổi nào
    saveUninitialized: true, // không tạo phiên làm việc cho người dùng nếu họ không đăng nhập
    cookie: {
      maxAge: 1000 * 60 * 15, // thời gian sống của cookie, ở đây là 15 phút sau khi người dùng đóng trình duyệt liên kết web
      sameSite: true, // cookie chỉ được gửi khi có cùng nguồn gốc
      secure: false, // chỉ gửi cookie qua HTTPS khi true
    }
  })
);

// Cấu hình middleware
app.use(bodyParser.json()); // Middleware để phân tích dữ liệu JSON từ request.
app.use(bodyParser.urlencoded({ extended: true })); // Middleware để phân tích dữ liệu từ form HTML.
app.use(flash()); // Middleware để hiển thị thông báo.
app.use(passport.initialize()); // Middleware để khởi tạo passport. ( để quản lí xác thực người dùng )
app.use(passport.session()); // Middleware sử dụng session của passport. ( để duy trì trạng thái đăng nhập qua các request )
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  console.log('User in session:', req.session.user);
  res.locals.user = req.session.user;
  const cart = req.session.cart || [];
  res.locals.cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  res.locals.successMessage = req.flash('successMessage');
  res.locals.errorMessage = req.flash('errorMessage');
  res.locals.isAdmin = req.session.user ? req.session.user.isAdmin : false; 
  next();
});

// Cấu hình các route
app.use('/', indexRouter);
app.use('/order-details', indexRouter); 
app.use('/cart', indexRouter);
app.use('/users', usersRouter);
// use admin
app.use('/admin', adminRouter);
app.use('/admin/products', adminproductsRouter);
app.use('/admin/orders', adminOrdersRouter);
app.use('/admin/users', adminUsersRouter);
// use account
app.use('/account/', accountRouter);
app.use('/register', accountRouter);

app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Cấu hình passport
passport.serializeUser((User, done)=> done(null, User.id)); 
passport.deserializeUser((id, done) => { 
  User.findById(id, (err, User) => done(err, User));
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});

module.exports = app;
