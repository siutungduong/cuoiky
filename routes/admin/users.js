const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const { isAdmin } = require('../../middleware');


router.use(isAdmin);

// Lấy tất cả người dùng hoặc tìm kiếm người dùng
router.get('/', async (req, res) => {
  try {
    const { search, searchField } = req.query;
    let query = {};
    if (search) {
      query[searchField] = new RegExp(search, 'i');
    }
    console.log('Query:', query); // Log the query
    const users = await User.find(query);
    console.log('Fetched users:', users); // Log the fetched users
    res.render('admin/users', { title: 'Quản lý người dùng', users });
  } catch (error) {
    console.error('Lỗi khi lấy người dùng:', error);
    res.status(500).send('Lỗi khi lấy người dùng');
  }
});

// Đặt hoặc gỡ bỏ vai trò admin của người dùng
router.post('/admin-role/:action/:id', async (req, res) => {
  const userId = req.params.id;
  const { action } = req.params;
  const isAdmin = action === 'make';
  try {
    await User.findByIdAndUpdate(userId, { isAdmin });
    req.flash('successMessage', isAdmin ? 'Phân quyền Admin thành công!' : 'Hủy quyền Admin thành công!');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Lỗi khi cập nhật vai trò người dùng:', error);
    req.flash('errorMessage', 'Có lỗi xảy ra khi cập nhật vai trò người dùng.');
    res.redirect('/admin/users');
  }
});

// Xuất router
module.exports = router;