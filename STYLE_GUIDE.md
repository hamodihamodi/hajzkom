# Hajzkom Style Guide

**Mandatory visual and UI/UX reference for every Hajzkom screen** (marketing pages, public booking, SaaS dashboard). When creating any screen, follow this file first, then screen-specific requirements.

**Reference design:** `hajzkom-landing.html` (project root) is the approved visual source of truth — copy its look (layout, colors, fonts, motion) for all future screens. The marketing layer styles live in `src/styles/marketing.css`.

---

## 1. Design Principles

- Modern, polished, professional SaaS product — premium quality, never a generic template.
- Calm, elegant identity built on deep teal/ocean (`primary`) and soft sky (`secondary`) over a warm paper background.
- Clarity, usability, consistency, hierarchy, and visual quality above decoration.
- Clean layouts, strong visual hierarchy, generous whitespace.
- **Arabic RTL is the default design direction.**
- Responsive by design: every screen is adapted for mobile, tablet, and desktop.

## 2. Color System (Single Source of Truth)

All colors come exclusively from the semantic tokens defined in `src/styles/global.css`. Never introduce new hex values, gradients, or decorative colors. If a screen needs a color, map its purpose to an existing token.

| Token | Value | Use for |
|---|---|---|
| `primary` | `#1D5655` teal | Primary buttons, active navigation, selected controls, links, key brand actions |
| `primary-hover` / `primary-pressed` | `#153F3E` / `#0F2E2D` | Hover / active states of the above |
| `primary-subtle` | `#E3EFEE` | Selected backgrounds, active menu items, soft highlights |
| `primary-tint` | `#CBE1DF` | Dashed accents, hover borders on cards |
| `secondary` | `#B0DEED` sky | Highlight underlines, decorative blocks, accents. **Never for small text on white** |
| `secondary-subtle` | `#E9F5FB` | Soft cool section backgrounds, info banners |
| `background` | `#FAF8F4` paper | Page background |
| `surface` | `#FFFFFF` | Cards, dialogs, dropdowns, elevated containers |
| `surface-subtle` / `surface-muted` | `#FCFBF8` / `#F0EFE9` | Grouped content, secondary sections, table headers |
| `surface-hover` | `#F4F1EA` | Row/list/item hover states |
| `text-primary` | `#16211F` ink | Headings and important content |
| `text-secondary` | `#3E4C4A` | Normal supporting content |
| `text-tertiary` | `#5F6E6C` | Metadata, timestamps, hints |
| `text-disabled` | — | Disabled states only |
| `text-on-primary` | `#FFFFFF` | Text/icons on primary-colored fills |
| `border-default` / `border-subtle` / `border-strong` | `#E5E1D6` / `#EEECE4` / `#D6D1C3` | Standard / low-emphasis / emphasized component borders |
| `border-focus` | = primary | Focus rings on interactive elements |
| `success` / `warning` / `error` / `info` (+ `-background`, `-border`, `-text`) | ok/warn/bad/info families | Status, alerts, validation, badges, feedback |
| `overlay` | `rgba(11,33,31,.58)` | Modal/dialog backdrops |

**Balance rule:** primary color anchors actions and orientation points only. Large page areas stay neutral (`background` / `surface`). Never flood a page with primary; dark immersive sections may use `primary-pressed`.

## 3. Typography

- **Headings: Alexandria** (`--font-heading`, weights 500–800). **Body/UI: IBM Plex Sans Arabic** (`--font-sans`, weights 400–700). Both loaded via Google Fonts in `index.html`.
- Clear hierarchy — size and weight carry meaning:

| Level | Style |
|---|---|
| H1 | `clamp(2.1rem, 4.6vw, 3.4rem)` weight 800 (hero); `text-3xl`–`text-5xl` elsewhere |
| H2 | `clamp(1.65rem, 3.2vw, 2.25rem)` weight 700 |
| H3 | `1.05rem`–`1.35rem` weight 700 |
| Body | `text-base` normal, `text-text-tertiary` for supporting copy |
| Small/meta | `text-sm`–`text-xs`, `text-text-tertiary` |
| Buttons/labels | `.95rem` medium/semibold |

- Line-height 1.75 body / 1.35–1.6 headings; avoid justified text; keep measure comfortable.

## 4. Layout & Spacing

- Consistent 4px base rhythm; use Tailwind spacing scale (`p-2…p-8`).
- Page container: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`.
- Section vertical padding scales up per breakpoint (`py-10 md:py-14 lg:py-20`).
- Cards/forms group related content with `gap-4`–`gap-6`; sections separated by whitespace first, borders second.
- Dashboard: sidebar + content shell on desktop; collapsible drawer under tablet.

## 5. Shape, Borders & Depth

- Rounded corners purposeful, not bubbly:
  - Inputs, small buttons, chips: `10px`–`12px`
  - Cards, tiles: `14px`–`18px`
  - Large feature cards/plans/modals: `20px`
  - Pills/badges/avatars: `rounded-full`
- Borders are subtle and common: `1px solid border-default`; dashed variants (`border-strong`) mark empty/free slots.
- Depth via surface layering with the themed soft shadows (`shadow-sm/md/lg` = layered warm-gray rgba); prefer `border` over shadow when possible, `shadow-lg` reserved for hero mockups, browser frame, dialogs.

## 6. Components

- **Eyebrow section label:** pill `primary-subtle` bg + `primary` text with rotated-square dot (`.eyebrow`).
- **Buttons:** one primary action per view (`btn-primary` = primary fill, hover lifts -2px with shadow); secondary = ghost with border; on dark sections use `btn-light` (paper bg + primary text). Height ≥ 40px, radius 12px.
- **Inputs:** white bg, `1.5px border-default` → focus `border-primary` + `3px primary-subtle` ring; label above field; errors use `error-*` tokens with clear Arabic messages.
- **Cards:** white surface + border-default, radius 14–18px, hover lift only if clickable.
- **Status pills:** `.pill p-done/p-conf/p-pend/p-canc` — soft background + strong color text.
- **Tables:** header row `surface-subtle`; highlighted column uses `primary-subtle` background; horizontal scroll wrapper on mobile.
- **Navigation:** active item = solid primary fill with white text in sidebars; `primary-subtle` tint for top navs.
- **Modals:** centered card on blurred `overlay` backdrop, radius 20px, springy entrance, close button top-end.
- **Toasts:** dark ink card bottom-start, stacked via the shared `Toaster` component (`toast()` from `src/utils/toast.ts`).

## 7. Interactions & Motion

- Match the reference feel: gentle scroll-reveal (`.reveal`/`.in` with stagger delays ~90ms), soft lift on card/button hover, subtle ambient loops allowed for live elements (pulse dot, floating chip, spinning sync arrow).
- Springs use `cubic-bezier(.34,1.3,.64,1)` for modals/toasts; standard `ease` transitions elsewhere (~200–300ms).
- Every interactive element has visible hover and focus-visible states using tokens.
- Touch targets ≥ 44×44px on mobile. Respect `prefers-reduced-motion`.

## 8. RTL Rules

- `dir="rtl"` inherited from root — never override per component unless embedding LTR data (e.g., codes, phone numbers).
- Use logical utilities: `ms-*`/`me-*`, `ps-*`/`pe-*`, `text-start`/`text-end`, `start-0`/`end-0` instead of physical ones.
- Mirror directional icons (chevrons, arrows) for RTL flow; Lucide icons otherwise used as-is at consistent sizes (`size-4`/`size-5`).

## 9. Responsiveness

Breakpoints (Tailwind v4 theme): `mobile:` ≥640px, `tablet:` ≥768px, `desktop:` ≥1024px (+ default sm/md/lg available).

- Mobile-first: single column, stacked cards, bottom-reachable actions.
- Tablet: 2-column layouts where useful, persistent sidebar optional.
- Desktop: full dashboard shells, multi-column grids, side-by-side forms.
- Never hide core functionality behind breakpoint; adapt density and layout instead.

## 10. Avoid

Outdated patterns, excessive gradients, glassmorphism, heavy/neon shadows, excessive transparency, emoji-as-icon in UI, cluttered decoration, generic AI aesthetics (purple-blue hero clichés, uniform 3-card rows without purpose), tiny tap targets, low-contrast gray-on-gray text, more than one primary action per view.

## 11. Pre-Screen Checklist

1. Only token colors used; primary used sparingly.
2. Clear hierarchy: one H1, logical heading order.
3. All states covered: hover, focus, disabled, loading, empty, error.
4. RTL-correct layout and mirrored icons.
5. Verified at mobile, tablet, and desktop widths.
6. Text contrast meets WCAG AA against its background.
7. Feels premium, calm, and consistent with existing screens.
