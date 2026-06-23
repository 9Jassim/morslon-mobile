# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-06-23T09:33:58.326Z
> Files: 69 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~128 tok)
- `AGENTS.md` — Expo HAS CHANGED (~30 tok)
- `app.json` (~324 tok)
- `CLAUDE.md` — OpenWolf (~60 tok)
- `LICENSE` — Project license (~295 tok)
- `package-lock.json` — npm lock file (~84690 tok)
- `package.json` — Node.js package manifest (~386 tok)
- `README.md` — Project documentation (~546 tok)
- `tsconfig.json` — TypeScript configuration (~72 tok)

## .claude/

- `settings.json` (~461 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## .claude/skills/frontend-design/

- `SKILL.md` — Design Thinking (~1122 tok)

## .expo/

- `devices.json` (~6 tok)
- `README.md` — Project documentation (~223 tok)

## .expo/dev/logs/

- `export.log` (~1645 tok)
- `start.log` (~74838 tok)

## assets/expo.icon/

- `icon.json` (~223 tok)

## scripts/

- `reset-project.js` — This script is used to reset the project to a blank state. (~1054 tok)

## src/

- `global.css` — Styles: 4 vars (~123 tok)

## src/app/

- `_layout.tsx` — RootLayout (~248 tok)
- `loyalty.tsx` — LoyaltyScreen — uses useQuery (~979 tok)
- `notifications.tsx` — App-only notifications feed. Placeholder until the backend exposes a (~284 tok)
- `profile.tsx` — ProfileScreen (~464 tok)
- `search.tsx` — SearchScreen — uses useState, useQuery (~569 tok)
- `wallet.tsx` — WalletScreen — uses useQuery (~962 tok)

## src/app/(tabs)/

- `_layout.tsx` — TabsLayout (~465 tok)
- `account.tsx` — THEME_ICON — uses useRouter (~1032 tok)
- `cart.tsx` — CartScreen (~1357 tok)
- `categories.tsx` — CategoriesScreen — uses useRouter, useQuery (~776 tok)
- `index.tsx` — HomeScreen — uses useQuery (~458 tok)
- `wishlist.tsx` — WishlistScreen — uses useQuery (~354 tok)

## src/app/category/

- `[slug].tsx` — CategoryScreen — uses useQuery (~412 tok)

## src/app/orders/

- `[id].tsx` — OrderDetailScreen — uses useQuery (~1043 tok)
- `index.tsx` — OrdersScreen — uses useRouter, useQuery (~817 tok)

## src/app/product/

- `[id].tsx` — ProductDetailScreen — uses useState, useQuery (~1104 tok)

## src/components/

- `animated-icon.module.css` — Styles: 1 rules (~41 tok)
- `animated-icon.tsx` — INITIAL_SCALE_FACTOR — uses useState (~868 tok)
- `animated-icon.web.tsx` — DURATION (~676 tok)
- `app-header.tsx` — Top bar shown on the main tabs: store logo + search + notifications. (~696 tok)
- `auth-required.tsx` — Shown on tabs/screens that require login when the user is a guest. (~332 tok)
- `external-link.tsx` — ExternalLink (~227 tok)
- `hint-row.tsx` — HintRow (~258 tok)
- `login-screen.tsx` — Email/password login against the Morslon backend's mobile auth endpoint. (~673 tok)
- `placeholder-screen.tsx` — Temporary placeholder for tabs/screens not yet built out. (~229 tok)
- `product-grid.tsx` — Two-column product grid. Pass a header to render above the list. (~704 tok)
- `status-badge.tsx` — Small pill showing an order status. (~177 tok)
- `themed-text.tsx` — ThemedText (~474 tok)
- `themed-view.tsx` — ThemedView (~142 tok)
- `web-badge.tsx` — WebBadge (~291 tok)

## src/components/ui/

- `button.tsx` — App-wide button. Handles loading + disabled states and two variants. (~504 tok)
- `collapsible.tsx` — Collapsible — uses useState (~550 tok)
- `input.tsx` — App-wide text input with consistent styling. (~150 tok)
- `screen.tsx` — Center content vertically + horizontally (e.g. for auth/empty states). (~383 tok)

## src/constants/

- `theme.ts` — Below are the colors that are used in the app. The colors are defined in the light and dark mode. (~476 tok)

## src/hooks/

- `use-color-scheme.ts` — Resolved color scheme: honours the user's manual preference (light/dark) (~146 tok)
- `use-color-scheme.web.ts` — Resolved color scheme for web. Honours the user's manual preference and (~215 tok)
- `use-theme.ts` — Learn more about light and dark modes: (~84 tok)

## src/lib/

- `account-api.ts` — GET /api/orders — current customer's orders (auth required). (~258 tok)
- `api.ts` — Thin fetch wrapper around the Morslon backend. (~960 tok)
- `auth-api.ts` — POST /api/mobile/auth/login — stores tokens and returns the customer. (~431 tok)
- `auth-context.tsx` — null while restoring the session on app launch. (~701 tok)
- `auth-storage.ts` — Persisted auth tokens for the Morslon backend. (~525 tok)
- `cart-store.ts` — Local, in-memory cart (mirrors the website's Zustand cart). Guests get a (~581 tok)
- `catalog-api.ts` — GET /api/mobile/config — public app bootstrap payload. (~512 tok)
- `images.ts` — Resolve a product image filename to a displayable URL. (~202 tok)
- `query.ts` — Shared React Query client. Sensible mobile defaults: cache for a minute, (~170 tok)
- `theme-colors.ts` — Brand colors — the single source of truth for the app's accent palette. (~288 tok)
- `theme-mode.ts` — User's chosen theme preference. 'system' follows the OS setting. (~163 tok)
- `types.ts` — Shared API types — mirror the Morslon backend response shapes. (~775 tok)
