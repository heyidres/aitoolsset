# ─────────────────────────────────────────────────────────────
#  AI Tools Set — production image
# ─────────────────────────────────────────────────────────────
#  Multi-stage build producing a Next.js `standalone` server.
#
#  Why standalone: it traces only the node_modules actually imported
#  at runtime, so the final image (and the resident memory of the
#  running container) stays small. On a usage-billed host like Railway
#  that RAM footprint IS the monthly bill, so it's worth the extra stage.
#
#  Base is `slim` (Debian), not `alpine`: sharp ships glibc prebuilds
#  that work here with no native compilation. Alpine/musl works too but
#  has more ways to fail, and the size difference is ~50 MB.
# ─────────────────────────────────────────────────────────────

# ── Stage 1: dependencies ────────────────────────────────────
FROM node:22-slim AS deps
WORKDIR /app

# Install from the lockfile only — reproducible, and fails loudly if
# package.json and package-lock.json have drifted apart.
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: build ───────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time configuration.
#
# These MUST be present during `next build`, not just at runtime:
#   • SUPABASE_URL / DATABASE_URL — pages with generateStaticParams query
#                             Postgres while rendering at build time.
#                             lib/db/index.ts prefers SUPABASE_URL and only
#                             falls back to DATABASE_URL if that's unset —
#                             both are declared here so the build honors the
#                             same precedence runtime does.
#   • SITE_URL              — becomes metadataBase for every canonical URL
#   • NEXT_PUBLIC_*         — inlined into the client bundle by the compiler,
#                             so setting them only at runtime has no effect
#
# Railway passes service variables to Docker builds as build args, but only
# for args the Dockerfile actually declares — hence the explicit ARG list.
ARG SUPABASE_URL
ARG DATABASE_URL
ARG SITE_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_SENTRY_DSN
ARG RAILWAY_GIT_COMMIT_SHA

ENV SUPABASE_URL=$SUPABASE_URL \
    DATABASE_URL=$DATABASE_URL \
    SITE_URL=$SITE_URL \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    RAILWAY_GIT_COMMIT_SHA=$RAILWAY_GIT_COMMIT_SHA \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: runtime ─────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Don't run the server as root.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# `standalone` deliberately excludes these two — they must be copied in
# separately or the app boots with no static assets and no /public files.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# Railway injects PORT at runtime; 3000 is the local-docker default.
# HOSTNAME=0.0.0.0 is required — the standalone server binds localhost
# otherwise, and the platform's health check could never reach it.
ENV PORT=3000 \
    HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["node", "server.js"]
