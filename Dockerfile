# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# No build args on purpose. API_URL / TODO_API_URL are read at REQUEST time by
# app/layout.tsx, so this image carries no environment-specific values and can
# be promoted unchanged from dev to staging to prod.
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
