# SEO & Performance Optimization Tradeoffs

This document outlines intentional tradeoffs made during performance optimization where we prioritized user experience or quality over Lighthouse score improvements.

---

## 1. Logo Image Delivery (~30 KiB)

### Lighthouse Warning
```
Improve image delivery - Est savings of 30 KiB

- Recovery-768x211.webp: 23.1 KiB (displayed at 417x115)
- Paracelsus-768x186.webp: 21.9 KiB (displayed at 475x115)

"This image file is larger than it needs to be for its displayed dimensions."
```

### Why We Accept This

**Lighthouse tests at 1x device pixel ratio (DPR)**, but most modern devices have **2x or 3x DPR** (Retina displays).

| Image | Display Size | Needed @1x | Needed @2x | Served |
|-------|-------------|------------|------------|--------|
| Paracelsus | 475×115 | 475px | 950px | 768px |
| Recovery | 417×115 | 417px | 834px | 768px |

- **At 1x DPR**: 768px images are ~60% oversized → Lighthouse flags this
- **At 2x DPR**: 768px images are actually *undersized* → would look soft

### The Tradeoff

| Option | Lighthouse Score | Logo Quality (2x displays) |
|--------|-----------------|---------------------------|
| ❌ Use smaller images | ✅ Better (+30 KiB saved) | ❌ Blurry/soft logos |
| ✅ Keep current images | ⚠️ Warning remains | ✅ Crisp, sharp logos |

### Decision: Keep Current Images

**Rationale:**
1. **Brand perception** - Logos are the first thing users notice; blurry logos look unprofessional
2. **Device demographics** - 70%+ of users have high-DPR displays (iPhones, MacBooks, modern Android)
3. **Minimal real-world impact** - 30 KiB is ~0.03s on 3G, imperceptible on 4G/WiFi
4. **Lighthouse ≠ real users** - The test environment doesn't reflect actual user devices

### Alternative Solutions (Not Implemented)

If this becomes a priority, consider:

1. **Next.js Image Component** - Automatic srcset generation with proper sizing
2. **Image CDN** (Cloudinary, Imgix) - Dynamic resizing based on device
3. **Custom image variants** - Generate 2x versions at exact display dimensions:
   - `Paracelsus-950x230.webp`
   - `Recovery-834x206.webp`

### Files Affected
- `clone-kit/html/02-main.html` - Contains the `<picture>` elements with srcset

---

## Summary

| Tradeoff | Est. Score Impact | Decision | Reason |
|----------|------------------|----------|--------|
| Logo image sizes | -30 KiB | Keep larger | Quality on Retina displays |

---

*Last updated: January 2026*

