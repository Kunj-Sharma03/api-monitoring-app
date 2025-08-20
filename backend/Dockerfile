FROM node:18-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install --production

# Expose port
EXPOSE 5000

# Start with direct node command
CMD ["node", "test.js"]
