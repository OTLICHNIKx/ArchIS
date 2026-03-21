# Берём официальный Node.js образ
FROM node:20-alpine

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install --production

# Копируем остальной код
COPY . .

# Открываем порт
EXPOSE 5000

# Запускаем сервер
CMD ["node", "index.js"]