var express = require('express');
var router = express.Router();
var Product = require('../models/product');
const { isAdmin } = require('../middleware');

let products = []; 


router.use(isAdmin);


router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('admin/products/index', { title: 'Danh sách sản phẩm', products });
  } catch (err) {
    res.status(500).send('Lỗi khi lấy sản phẩm từ cơ sở dữ liệu');
  }
});


router.route('/add')
  .get((req, res) => {
    res.render('admin/products/add', { title: 'Thêm sản phẩm' });
  })
  .post(async (req, res) => {
    const { type, name, price, image, brand } = req.body; 
    const product = new Product({
      type: type,
      name: name,
      price: price,
      image: image,
      brand: brand
    });
    try {
      await product.save();
      res.redirect('/admin/products');
    } catch (err) {
      res.status(500).send('Lỗi khi lưu sản phẩm');
    }
  });



router.route('/edit/:id')
  .get(async (req, res) => {
    const id = req.params.id;
    try {
      const product = await Product.findById(id);
      if (!product) return res.status(404).send('Không tìm thấy sản phẩm');
      res.render('admin/products/edit', { title: 'Chỉnh sửa sản phẩm', product });
    } catch (err) {
      res.status(500).send('Lỗi khi lấy sản phẩm');
    }
  })
  .post(async (req, res) => {
    const id = req.params.id;
    const { type, name, price, image, brand } = req.body;
    try {
      const updatedProduct = await Product.findByIdAndUpdate(id, { 
        type, 
        name, 
        price, 
        image, 
        brand 
      }, { new: true });
      if (!updatedProduct) return res.status(404).send('Không tìm thấy sản phẩm');
      res.redirect('/admin/products');
    } catch (err) {
      res.status(500).send('Lỗi khi cập nhật sản phẩm');
    }
  });


router.get('/delete/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    await Product.findByIdAndDelete(id);
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Lỗi khi xóa sản phẩm');
  }
});

module.exports = router;
