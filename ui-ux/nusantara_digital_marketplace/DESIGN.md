---
name: Nusantara Digital Marketplace
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: auto
  max-width-desktop: 1280px
---

## Brand & Style

The design system is engineered for the fast-paced Indonesian e-commerce landscape, prioritizing **trust, efficiency, and clarity**. The brand personality is "The Reliable Partner"—professional yet energetic, ensuring users feel secure while navigating a high-volume marketplace. 

The aesthetic follows a **Modern Corporate** style with a **Mobile-First Philosophy** translated to desktop. It leverages high-quality white space and a structured information hierarchy to reduce cognitive load during the shopping journey. Visual elements are clean and functional, avoiding unnecessary decorative flourishes to keep the focus on product imagery and transactional clarity.

## Colors

This design system utilizes a high-contrast palette to drive conversion and trust. 
- **Primary Blue (#2563EB)** is used for main actions, navigation, and branding to evoke stability and security.
- **Secondary Orange (#F97316)** is reserved for high-urgency triggers, such as "Beli Sekarang" (Buy Now) or flash sale highlights.
- **Semantic Colors** are used strictly for status communication. Notably, **Pre-Order Violet (#7C3AED)** is introduced to distinguish unique logistics statuses common in the local market.
- **Neutral Tones** follow a slate-gray scale to ensure text legibility and UI depth without appearing stark.

## Typography

The typography system uses a mix of **Inter** for core UI and readability, and **Geist** for technical or data-heavy labels to provide a subtle modern edge.

- **Hierarchy:** Clear distinction between product titles (Semibold/Bold) and descriptions (Regular).
- **Localization:** Line heights are slightly generous to accommodate Indonesian word lengths which can be longer than English counterparts.
- **Scale:** A strict 12/14/16/20/24/32/40 scale ensures consistent vertical rhythm.

## Layout & Spacing

The design system adopts a **4px incremental scale** (consistent with Tailwind CSS defaults) to ensure mathematical harmony across all components.

- **Grid:** A 12-column fluid grid for desktop with a maximum container width of 1280px. On mobile, a 2-column or single-column stack is standard.
- **Rhythm:** Use `md (16px)` for standard padding within cards and `lg (24px)` for section spacing. 
- **Touch Targets:** Minimum touch targets for interactive elements are 44x44px, even when rendered on desktop, to maintain the mobile-first philosophy.

## Elevation & Depth

This design system uses **Tonal Layers** and **Soft Ambient Shadows** to define hierarchy. 

- **Level 0 (Background):** Flat white or light gray (#F8FAFC).
- **Level 1 (Cards/Surface):** White background with a subtle 1px border (#E2E8F0) and a soft shadow (Y: 1px, Blur: 3px, Opacity: 0.05).
- **Level 2 (Dropdowns/Popovers):** Higher elevation with a more pronounced shadow (Y: 4px, Blur: 6px, Opacity: 0.1) to signify temporary overlay.
- **Interactive:** Hover states on cards should involve a slight Y-axis lift (-2px) and a deepening of the shadow to indicate clickability.

## Shapes

The shape language is "Approachable Geometric." 
- **Cards & Containers:** Use `rounded-lg` (8px) to provide a soft, modern container for product imagery.
- **Interactive Elements:** Buttons, Input fields, and Badges use `rounded-md` (6px). This slight reduction in radius compared to cards creates a nested visual logic where internal components feel "sturdier" than their parent containers.
- **Icons:** Use a 2px stroke weight with slightly rounded caps to match the typography.

## Components

Components follow the **shadcn/ui** philosophy: functional, accessible, and unopinionated.

- **Buttons:** 
  - *Primary:* Blue background, white text. 
  - *Secondary:* White background, blue border/text.
  - *CTA (Buy Now):* Orange background for maximum conversion.
- **Badges (Tags):** 
  - Used for "Diskon," "Grosir," or "Pre-Order."
  - Small text (12px) with 2px vertical and 8px horizontal padding.
- **Inputs:** 
  - Bordered (#E2E8F0) with a focus ring of Primary Blue at 25% opacity.
  - Placeholder text in muted slate.
- **Cards:** 
  - Product cards must have a fixed aspect ratio for images (1:1). 
  - Include a subtle "Wishlist" heart icon in the top right.
- **Tables:** 
  - Used for order history and "Daftar Transaksi." 
  - Minimalist borders, header row with light gray background, and 14px text.
- **Custom Local Components:**
  - *Kurir Selector:* A specialized list component for choosing logistics providers (JNE, GoSend, etc.).
  - *Payment Method Chip:* Visual indicators for VA, E-Wallet, or Alfamart/Indomaret.