FROM node:18-bullseye-slim

ENV NODE_ENV=production

WORKDIR /app

# Install build dependencies for native modules like bcrypt
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

# Copy backend package files first to leverage Docker layer caching
COPY backend/package*.json ./

# Install production dependencies for backend
RUN npm ci --only=production --verbose || npm install --omit=dev --verbose

# Copy backend application source
COPY backend/. .

# Expose application port (Railway will inject PORT)
EXPOSE 5000

# Start the application directly with Node to avoid npm lifecycle edge cases
CMD ["node", "index.js"]
