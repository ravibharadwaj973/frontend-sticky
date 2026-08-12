# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# NEXT_PUBLIC_* values are inlined at build time, so they have to be present here
ARG NEXT_PUBLIC_TODO_API_URL
ENV NEXT_PUBLIC_TODO_API_URL=$NEXT_PUBLIC_TODO_API_URL
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
