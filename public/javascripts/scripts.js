// Xác nhận trước khi xóa sản phẩm
function confirmDelete(event) {
  if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho không?")) {
    event.preventDefault(); // Ngăn chặn hành động nếu người dùng nhấn 'Hủy'
  }
}

// Thêm sự kiện xác nhận vào tất cả các nút 'Xóa'
document.addEventListener("DOMContentLoaded", () => {
  const deleteLinks = document.querySelectorAll(".btn.delete");
  deleteLinks.forEach(link => {
    link.addEventListener("click", confirmDelete);
  });

  const updateButtons = document.querySelectorAll(".btn.update-status");
  updateButtons.forEach(button => {
    button.addEventListener("click", async (event) => {
      const orderId = event.target.getAttribute("data-order-id");
      const statusSelect = document.querySelector(`select[data-order-id="${orderId}"]`);
      const status = statusSelect.value;

      try {
        const response = await fetch('/admin/orders/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status })
        });
        const data = await response.json();
        alert(data.message);
      } catch (error) {
        console.error('Error updating order status:', error);
      }
    });
  });
});

// Hiển thị ảnh trước khi tải lên
document.getElementById('image-url').addEventListener('input', function() {
  const imageUrl = this.value;
  const imagePreview = document.getElementById('image-preview');
  
  if (imageUrl) {
      imagePreview.src = imageUrl;
      imagePreview.style.display = 'block';
  } else {
      imagePreview.style.display = 'none';
  }
});

// Hủy việc thêm sản phẩm
document.getElementById('cancel-button').addEventListener('click', function() {
  window.location.href = '/admin/products';
});

function addToCart(productId) {
  fetch(`/cart/add/${productId}`, { method: 'POST' })
    .then(response => response.json())
    .then(data => location.reload())
    .catch(error => console.error('Error:', error));
}

function updateCart(productId, action) {
  fetch(`/cart/update/${productId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  })
    .then(response => response.json())
    .then(data => location.reload())
    .catch(error => console.error('Error:', error));
}

function removeFromCart(productId) {
  fetch(`/cart/remove/${productId}`, { method: 'POST' })
    .then(response => response.json())
    .then(data => location.reload())
    .catch(error => console.error('Error:', error));
}

function handleCheckout() {
  fetch('/check-login', { method: 'GET' })
    .then(response => response.json())
    .then(data => {
      if (data.isLoggedIn) {
        // Chuyển đến trang thanh toán
        window.location.href = '/checkout';
      } else {
        // Chuyển đến trang đăng nhập
        window.location.href = '/login';
      }
    })
    .catch(err => {
      console.error('Lỗi kiểm tra đăng nhập:', err);
    });
}

function cancelOrder(orderId) {
  fetch(`/order/cancel/${orderId}`, { method: 'POST' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      alert('Order cancelled successfully');
      location.reload();
    })
    .catch(error => console.error('Error:', error));
}

function reorder(orderId) {
  fetch(`/order/reorder/${orderId}`, { method: 'POST' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      window.location.href = '/checkout';
    })
    .catch(error => console.error('Error:', error));
}

function returnOrder(orderId) {
  fetch(`/order/return/${orderId}`, { method: 'POST' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      alert('Order return initiated successfully');
      location.reload();
    })
    .catch(error => console.error('Error:', error));
}


document.querySelectorAll('.admin-role-form').forEach(form => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Ngăn form gửi request bình thường
    const url = form.action;
    try {
      const response = await fetch(url, { method: 'POST' });
      if (response.ok) {
        alert('Thay đổi quyền thành công!');
        location.reload(); // Tải lại trang sau khi thành công
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (err) {
      console.error(err);
      alert('Kết nối thất bại!');
    }
  });
});