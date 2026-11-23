# ─── Étape 1 : dépendances ───────────────────────────────────────
FROM node:20-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends openssl python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ─── Étape 2 : build Next.js ────────────────────────────────────
FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
# --webpack : Turbopack plantait sur le worker PostCSS lors de nos tests
RUN npx next build --webpack

# ─── Étape 3 : image de production ──────────────────────────────
FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV UPLOAD_DIR=/app/uploads

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Client Prisma + moteur natif (au cas où le tracing en oublie une partie)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads
USER nextjs

# PORT et HOSTNAME sont fournis par docker-compose
CMD ["node", "server.js"]
