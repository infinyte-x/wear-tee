# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.1

# --- Build Stage ---
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# Install dependencies (npm ci for deterministic builds)
COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source files (excluding .env, .git, etc. via .dockerignore)
COPY --link . .

# Build the app (assumes a build script is defined in package.json)
RUN npm run build

# Remove dev dependencies and reinstall only production dependencies
RUN rm -rf node_modules && \
    npm ci --omit=dev

# --- Production Stage ---
FROM node:${NODE_VERSION}-slim AS final
WORKDIR /app

# Create non-root user
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

# Copy built app and production node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy any public/static assets if needed
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
USER appuser

# Expose port (change if your app uses a different port)
EXPOSE 3000

# Start the app (assumes npm start is defined)
CMD ["npm", "start"]
