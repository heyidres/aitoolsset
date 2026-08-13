#!/bin/sh
set -e

# A mounted Docker/Railway Volume always comes back root-owned on mount —
# that's true even though the image's build stage already chown'd this
# same path to nextjs:nodejs, because the volume mount happens at
# container start and overlays (hides) whatever the image had baked in
# there. Without this fixup, the non-root `nextjs` user the server
# actually runs as can't write here, so ISR cache writes fail silently
# at runtime and every page quietly re-renders on every request —
# defeating the entire point of mounting a persistent volume here.
if [ -d /app/.next/cache ]; then
  chown -R nextjs:nodejs /app/.next/cache
fi

# Drop from root (needed above for chown) to the unprivileged `nextjs`
# user for the actual server process. `-p` preserves the environment
# (PORT, HOSTNAME, SUPABASE_URL, etc. that Railway injects at runtime —
# `su` without it resets to a fresh login environment and the server
# would boot with none of them). `exec` replaces this shell with su, and
# su's own `-c` command replaces ITS shell with node in turn, so the
# server ends up as PID 1's direct child rather than sitting behind two
# idle wrapper shells — that matters for SIGTERM to reach it promptly
# during Railway's deploy-replacement drain window (lib/db/index.ts's
# after() hook needs that signal to close DB connections cleanly).
#
# Deliberately not forwarding Docker CMD/"$@" through here — su's `-c`
# takes a single command string, and generically re-quoting arbitrary
# argv through it is a well-known footgun. This image's CMD has always
# been exactly `node server.js`, so it's hardcoded below instead;
# Dockerfile's CMD is kept only as documentation of that intent.
exec su -p nextjs -s /bin/sh -c 'exec node server.js'
