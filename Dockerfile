FROM node:21-alpine

# Tạo thư mục và đảm bảo quyền sở hữu đúng
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node  # Chạy các lệnh sau dưới quyền user node

RUN npm install --unsafe-perm

COPY --chown=node:node . .

EXPOSE 3000
CMD ["node", "app.js"]
