FROM node:18-alpine

# Add debugging info
RUN echo "=== Docker Build Debug ===" && \
    node --version && \
    npm --version

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Show what we're working with
RUN ls -la && \
    cat package.json

# Install dependencies
RUN npm install --omit=dev --no-cache --no-fund --no-audit --verbose

# Copy source code
COPY . .

# Show final file structure
RUN ls -la && \
    echo "=== Files copied ===" && \
    echo "Node modules:" && ls node_modules/ | head -10

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "console.log('Health check')" || exit 1

# Start the application with debugging
CMD ["sh", "-c", "echo 'Starting application...' && npm start"]
