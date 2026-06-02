FROM node:22-slim AS deps
WORKDIR /app

COPY bioactiva-crm/package.json ./
COPY bioactiva-crm/package-lock.json ./
RUN npm install

FROM node:22-slim AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_USE_MOCK
ARG NEXT_PUBLIC_APP_NAME

COPY --from=deps /app/node_modules ./node_modules
COPY bioactiva-crm/ ./

RUN npm run build

FROM node:22-slim AS runner
ENV NODE_OPTIONS="--max-old-space-size=4096"
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 4000

CMD ["node", "server.js"]