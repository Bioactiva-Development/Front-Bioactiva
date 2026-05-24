FROM node:22-slim AS deps
WORKDIR /app

RUN corepack enable
COPY bioactiva-crm/package*.json ./
RUN pnpm install

FROM node:22-slim AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_USE_MOCK
ARG NEXT_PUBLIC_APP_NAME

COPY --from=deps /app/node_modules ./node_modules
COPY bioactiva-crm/ ./

RUN pnpm build
FROM node:22-slim AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 4000
CMD ["node", "server.js"]
