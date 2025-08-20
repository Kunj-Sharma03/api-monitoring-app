FROM node:18-bullseye-slim

ENV NODE_ENV=production

WORKDIR /app

# Install build dependencies for native modules like bcrypt
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production --verbose

# Copy application source
COPY . .

# Expose application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
