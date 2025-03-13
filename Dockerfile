# Sử dụng Node.js phiên bản LTS
FROM node:18

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và package-lock.json trước để cache dependencies
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

# Expose port để container lắng nghe (dùng giá trị từ file .env)
EXPOSE 3000

# Lệnh chạy ứng dụng
CMD ["npm", "start"]
