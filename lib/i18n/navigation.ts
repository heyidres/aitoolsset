/**
 * Locale-aware navigation primitives — drop-in replacements for
 *   import Link from "next/link"
 *   import { useRouter } from "next/navigation"
 *   import { redirect } from "next/navigation"
 *
 * Every internal href passed to <Link> is automatically prefixed
 * with the active locale (e.g. /blog → /ko/blog when on Korean).
 * Hover preview, click-to-navigate, prefetch, and SEO crawlers
 * all see the localized URL.
 *
 * External URLs (http:// or https://) and absolute paths to
 * non-localized routes (/api/*, /admin/*) pass through unchanged.
 */

import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
