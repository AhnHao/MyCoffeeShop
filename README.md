# Anteiku Coffee Shop

Anteiku Coffee Shop là một ứng dụng web quản lý cửa hàng cà phê, cung cấp các tính năng như quản lý sản phẩm, giỏ hàng, thanh toán trực tuyến, và gửi email thông báo.

## **Chức năng chính**

- **Quản lý người dùng**: Đăng ký, đăng nhập, và đăng xuất.
- **Quản lý sản phẩm**: Xem danh sách sản phẩm, thêm vào giỏ hàng.
- **Thanh toán trực tuyến**: Tích hợp thanh toán an toàn qua **Stripe**.
- **Gửi email thông báo**: Xác nhận đơn hàng qua email.
- **Quản lý giỏ hàng**: Thêm, xóa, hoặc cập nhật sản phẩm trong giỏ hàng.

## **Công nghệ sử dụng**

- **Front-end**: HTML5, CSS3, Bootstrap, EJS.
- **Back-end**: Node.js, Express.js, Mongoose.
- **Cơ sở dữ liệu**: MongoDB (Atlas).
- **Thanh toán**: Stripe.
- **Email**: Nodemailer, Mailtrap.
- **Quản lý môi trường**: Dotenv.

## **Hướng dẫn cài đặt**

### **Yêu cầu hệ thống**

- **Node.js**: Phiên bản 14 trở lên.
- **MongoDB**: Đã cài đặt hoặc sử dụng MongoDB Atlas.

### **Các bước cài đặt**

1. **Clone dự án**:
   ```bash
   git clone https://github.com/your-repo/AnteikuCoffeeShop.git
   cd AnteikuCoffeeShop
   ```
2. **Cài đặt các phụ thuộc**:
   ```bash
   npm install
   ```
3. **Cài đặt biến môi trường**:
   ```bash
   npm install --save-dev dotenv
   ```
4. **Tạo file .env tại thư mục gốc dự án và cấu hình với nội dung sau**:
   ```env
   DB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority || your_mongodb_uriuri
   STRIPE_SECRET_KEY=your_stripe_secret_key
   MAILTRAP_USER=your_mailtrap_user
   MAILTRAP_PASS=your_mailtrap_pass
   ```
5. **Chạy dự án**:
   ```bash
   node app.js
   ```
