FROM node:18-alpine

WORKDIR /usr/src/app

# Install runtime dependencies
RUN apk add --no-cache curl

# Copy package metadata first for layer caching
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy source
COPY . .

# Create unprivileged user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

# Docker healthcheck against the app health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the server (ensure instrumentation is imported)
CMD ["node", "--import", "./instrument.js", "server.js"]
