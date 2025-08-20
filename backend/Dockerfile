FROM node:18-alpine

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --verbose

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start with direct node command
CMD ["node", "test.js"]
