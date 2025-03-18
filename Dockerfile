FROM node:18
# Tạo thư mục và thiết lập quyền
WORKDIR /home/node/app
RUN mkdir -p node_modules && chown -R node:node /home/node/app

# Copy package.json trước để tối ưu cache
COPY package*.json ./

# Chạy npm install với user node
USER node
RUN npm install

# Copy toàn bộ source code với quyền user node
COPY --chown=node:node . .

# Expose port
EXPOSE 3000

# Chạy ứng dụng
CMD ["node", "app.js"]

