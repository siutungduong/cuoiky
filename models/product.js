var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function generateProductCode() {
  return Math.floor(Math.random() * 10000000000000).toString();
}

var productSchema = new Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  brand: { type: String, required: true }, 
  productCode: { type: String, default: generateProductCode }
});


var Product = mongoose.model('Product', productSchema);

module.exports = Product;
