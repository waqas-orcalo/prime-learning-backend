# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Builder
#   Installs ALL dependencies (including devDeps) and compiles TypeScript.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifest files first for layer-caching
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Install all deps (including devDependencies needed for build)
RUN npm ci

# Copy source and build
COPY src/ ./src/
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Production
#   Only production dependencies + compiled output.
#   Results in a lean final image (~200 MB vs ~700 MB with devDeps).
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Needed by some native modules (bcrypt, etc.)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy manifest files
COPY package*.json ./

# Install production-only dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Winston file transports mkdir under ./logs — /app is root-owned, so appuser needs this dir
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app/logs

USER appuser

# Expose the app port (default 3000)
EXPOSE 3000

# Health-check — hits the Swagger endpoint which is always public
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/docs || exit 1

# Start the compiled app
CMD ["node", "dist/main"]
