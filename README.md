# Quantum 1 — Hyperstar Developers

A futuristic, scroll-animated landing page for **Quantum 1**, India's next-gen institutional business address by Hyperstar Developers.

## Features

- Animated starfield canvas background that reacts to scroll velocity
- Smooth scrolling via [Lenis](https://lenis.darkroom.engineering/)
- Scroll-driven motion (pinned image reveal, parallax, line-split headings, staggered cards, animated counters) via [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- Cursor-tracking glow on feature cards
- Horizontal-scroll brochure gallery with a gated lead-capture modal (downloads `assets/quantum1-brochure.pdf`)
- "Residences" render gallery with category filters and a keyboard-navigable lightbox
- Fully responsive, respects `prefers-reduced-motion`

## Run locally

No build step — it's a static site. Serve the folder with any static server:

```bash
python3 -m http.server 5173
# then open http://localhost:5173
```

## Structure

```
index.html      # page markup
css/style.css   # theme & layout
js/main.js      # starfield + scroll animations
assets/         # brand imagery
```

All libraries (GSAP, ScrollTrigger, Lenis) load from CDN — no dependencies to install.
