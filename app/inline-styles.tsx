"use client";

import { useEffect } from "react";

/**
 * InlineStyles component injects WordPress inline CSS blocks into the document head.
 * These are required for:
 * 1. @font-face declarations (wp-fonts-local) - enables custom fonts
 * 2. CSS custom properties (global-styles-inline-css) - defines font families, colors, spacing
 * 3. Block style variations - typography styles
 * 4. Core block supports - layout constraints
 */
export default function InlineStyles() {
  useEffect(() => {
    // 1. Font face declarations - self-hosted fonts
    const fontStyles = `
@font-face {
    font-family: "Reckless Neue";
    font-style: normal;
    font-weight: 300;
    font-display: swap;
    src: url('/wp-content/themes/pegasus/assets/fonts/reckless-neue/RecklessNeue-Regular.woff2') format('woff2');
}

@font-face {
    font-family: "TWK Lausanne Pan";
    font-style: normal;
    font-weight: 250;
    font-display: swap;
    src: url('/wp-content/themes/pegasus/assets/fonts/lausanne-pan/TWKLausannePan-250.woff2') format('woff2');
}

@font-face {
    font-family: "TWK Lausanne Pan";
    font-style: normal;
    font-weight: 300;
    font-display: swap;
    src: url('/wp-content/themes/pegasus/assets/fonts/lausanne-pan/TWKLausannePan-300.woff2') format('woff2');
}

@font-face {
    font-family: "TWK Lausanne Pan";
    font-style: normal;
    font-weight: 450;
    font-display: swap;
    src: url('/wp-content/themes/pegasus/assets/fonts/lausanne-pan/TWKLausannePan-450.woff2') format('woff2');
}
    `.trim();

    // 2. Global styles - CSS custom properties (extracted from homepage.outer.html)
    // This defines --wp--preset--font-family--body and --wp--preset--font-family--heading
    const globalStyles = `
:root {
    --wp--preset--aspect-ratio--square: 1;
    --wp--preset--aspect-ratio--4-3: 4/3;
    --wp--preset--aspect-ratio--3-4: 3/4;
    --wp--preset--aspect-ratio--3-2: 3/2;
    --wp--preset--aspect-ratio--2-3: 2/3;
    --wp--preset--aspect-ratio--16-9: 16/9;
    --wp--preset--aspect-ratio--9-16: 9/16;
    --wp--preset--aspect-ratio--post: 8/7;
    --wp--preset--color--black: #000000;
    --wp--preset--color--cyan-bluish-gray: #abb8c3;
    --wp--preset--color--white: #ffffff;
    --wp--preset--color--pale-pink: #f78da7;
    --wp--preset--color--vivid-red: #cf2e2e;
    --wp--preset--color--luminous-vivid-orange: #ff6900;
    --wp--preset--color--luminous-vivid-amber: #fcb900;
    --wp--preset--color--light-green-cyan: #7bdcb5;
    --wp--preset--color--vivid-green-cyan: #00d084;
    --wp--preset--color--pale-cyan-blue: #8ed1fc;
    --wp--preset--color--vivid-cyan-blue: #0693e3;
    --wp--preset--color--vivid-purple: #9b51e0;
    --wp--preset--color--pale-01: #FAF6EE;
    --wp--preset--color--pale-02: #F3EDDA;
    --wp--preset--color--pale-03: #E8D7B9;
    --wp--preset--color--yellow-01: #FFE9C0;
    --wp--preset--color--yellow-02: #FFD48B;
    --wp--preset--color--green-01: #C8C9A9;
    --wp--preset--color--green-02: #576A28;
    --wp--preset--color--dark-01: #181918;
    --wp--preset--color--dark-02: #6A665B;
    --wp--preset--color--gray-01: #F5F5F1;
    --wp--preset--color--gray-02: #E1E1DD;
    --wp--preset--color--mid: #C5BEAA;
    --wp--preset--color--mid-02: #A29265;
    --wp--preset--color--dark: #888479;
    --wp--preset--gradient--vivid-cyan-blue-to-vivid-purple: linear-gradient(135deg, rgb(6, 147, 227) 0%, rgb(155, 81, 224) 100%);
    --wp--preset--gradient--light-green-cyan-to-vivid-green-cyan: linear-gradient(135deg, rgb(122, 220, 180) 0%, rgb(0, 208, 130) 100%);
    --wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange: linear-gradient(135deg, rgb(252, 185, 0) 0%, rgb(255, 105, 0) 100%);
    --wp--preset--gradient--luminous-vivid-orange-to-vivid-red: linear-gradient(135deg, rgb(255, 105, 0) 0%, rgb(207, 46, 46) 100%);
    --wp--preset--gradient--very-light-gray-to-cyan-bluish-gray: linear-gradient(135deg, rgb(238, 238, 238) 0%, rgb(169, 184, 195) 100%);
    --wp--preset--gradient--cool-to-warm-spectrum: linear-gradient(135deg, rgb(74, 234, 220) 0%, rgb(151, 120, 209) 20%, rgb(207, 42, 186) 40%, rgb(238, 44, 130) 60%, rgb(251, 105, 98) 80%, rgb(254, 248, 76) 100%);
    --wp--preset--gradient--blush-light-purple: linear-gradient(135deg, rgb(255, 206, 236) 0%, rgb(152, 150, 240) 100%);
    --wp--preset--gradient--blush-bordeaux: linear-gradient(135deg, rgb(254, 205, 165) 0%, rgb(254, 45, 45) 50%, rgb(107, 0, 62) 100%);
    --wp--preset--gradient--luminous-dusk: linear-gradient(135deg, rgb(255, 203, 112) 0%, rgb(199, 81, 192) 50%, rgb(65, 88, 208) 100%);
    --wp--preset--gradient--pale-ocean: linear-gradient(135deg, rgb(255, 245, 203) 0%, rgb(182, 227, 212) 50%, rgb(51, 167, 181) 100%);
    --wp--preset--gradient--electric-grass: linear-gradient(135deg, rgb(202, 248, 128) 0%, rgb(113, 206, 126) 100%);
    --wp--preset--gradient--midnight: linear-gradient(135deg, rgb(2, 3, 129) 0%, rgb(40, 116, 252) 100%);
    --wp--preset--font-size--small: clamp(0.813rem, 0.813rem + ((1vw - 0.244rem) * 0.285), 1rem);
    --wp--preset--font-size--medium: clamp(18px, 1.125rem + ((1vw - 3.9px) * 0.19), 20px);
    --wp--preset--font-size--large: clamp(20px, 1.25rem + ((1vw - 3.9px) * 0.476), 25px);
    --wp--preset--font-size--x-large: clamp(25px, 1.563rem + ((1vw - 3.9px) * 0.571), 31px);
    --wp--preset--font-size--x-small: 13px;
    --wp--preset--font-size--xx-large: clamp(25px, 1.563rem + ((1vw - 3.9px) * 1.333), 39px);
    --wp--preset--font-size--xxx-large: clamp(31px, 1.938rem + ((1vw - 3.9px) * 1.714), 49px);
    --wp--preset--font-size--xxxx-large: clamp(39px, 2.438rem + ((1vw - 3.9px) * 2.095), 61px);
    --wp--preset--font-family--heading: Reckless Neue, serif;
    --wp--preset--font-family--body: TWK Lausanne Pan, sans-serif;
    --wp--preset--spacing--20: 40px;
    --wp--preset--spacing--30: 60px;
    --wp--preset--spacing--40: clamp(3.75rem, 4.16vw, 6rem);
    --wp--preset--spacing--50: clamp(5.625rem, 6.25vw, 8rem);
    --wp--preset--spacing--60: clamp(6.25rem, 8.3vw, 12rem);
    --wp--preset--spacing--70: 3.38rem;
    --wp--preset--spacing--80: 5.06rem;
    --wp--preset--spacing--10: 1rem;
    --wp--preset--spacing--100: auto;
    --wp--preset--shadow--natural: 6px 6px 9px rgba(0, 0, 0, 0.2);
    --wp--preset--shadow--deep: 12px 12px 50px rgba(0, 0, 0, 0.4);
    --wp--preset--shadow--sharp: 6px 6px 0px rgba(0, 0, 0, 0.2);
    --wp--preset--shadow--outlined: 6px 6px 0px -3px rgb(255, 255, 255), 6px 6px rgb(0, 0, 0);
    --wp--preset--shadow--crisp: 6px 6px 0px rgb(0, 0, 0);
}

.wp-block-button .wp-block-button__link {
    --wp--preset--font-size--x-small: 13px;
}

:root {
    --wp--style--global--content-size: 100%;
    --wp--style--global--wide-size: 100%;
}

:where(body) {
    margin: 0;
}

.wp-site-blocks {
    padding-top: var(--wp--style--root--padding-top);
    padding-bottom: var(--wp--style--root--padding-bottom);
}

.has-global-padding {
    padding-right: var(--wp--style--root--padding-right);
    padding-left: var(--wp--style--root--padding-left);
}

.has-global-padding>.alignfull {
    margin-right: calc(var(--wp--style--root--padding-right) * -1);
    margin-left: calc(var(--wp--style--root--padding-left) * -1);
}

.has-global-padding :where(:not(.alignfull.is-layout-flow) > .has-global-padding:not(.wp-block-block, .alignfull)) {
    padding-right: 0;
    padding-left: 0;
}

.has-global-padding :where(:not(.alignfull.is-layout-flow) > .has-global-padding:not(.wp-block-block, .alignfull))>.alignfull {
    margin-left: 0;
    margin-right: 0;
}

.wp-site-blocks>.alignleft {
    float: left;
    margin-right: 2em;
}

.wp-site-blocks>.alignright {
    float: right;
    margin-left: 2em;
}

.wp-site-blocks>.aligncenter {
    justify-content: center;
    margin-left: auto;
    margin-right: auto;
}

:where(.wp-site-blocks)>* {
    margin-block-start: 24px;
    margin-block-end: 0;
}

:where(.wp-site-blocks)> :first-child {
    margin-block-start: 0;
}

:where(.wp-site-blocks)> :last-child {
    margin-block-end: 0;
}

:root {
    --wp--style--block-gap: 24px;
}

:root :where(.is-layout-flow)> :first-child {
    margin-block-start: 0;
}

:root :where(.is-layout-flow)> :last-child {
    margin-block-end: 0;
}

:root :where(.is-layout-flow)>* {
    margin-block-start: 24px;
    margin-block-end: 0;
}

:root :where(.is-layout-constrained)> :first-child {
    margin-block-start: 0;
}

:root :where(.is-layout-constrained)> :last-child {
    margin-block-end: 0;
}

:root :where(.is-layout-constrained)>* {
    margin-block-start: 24px;
    margin-block-end: 0;
}

:root :where(.is-layout-flex) {
    gap: 24px;
}

:root :where(.is-layout-grid) {
    gap: 24px;
}

.is-layout-flow>.alignleft {
    float: left;
    margin-inline-start: 0;
    margin-inline-end: 2em;
}

.is-layout-flow>.alignright {
    float: right;
    margin-inline-start: 2em;
    margin-inline-end: 0;
}

.is-layout-flow>.aligncenter {
    margin-left: auto !important;
    margin-right: auto !important;
}

.is-layout-constrained>.alignleft {
    float: left;
    margin-inline-start: 0;
    margin-inline-end: 2em;
}

.is-layout-constrained>.alignright {
    float: right;
    margin-inline-start: 2em;
    margin-inline-end: 0;
}

.is-layout-constrained>.aligncenter {
    margin-left: auto !important;
    margin-right: auto !important;
}

.is-layout-constrained> :where(:not(.alignleft):not(.alignright):not(.alignfull)) {
    max-width: var(--wp--style--global--content-size);
    margin-left: auto !important;
    margin-right: auto !important;
}

.is-layout-constrained>.alignwide {
    max-width: var(--wp--style--global--wide-size);
}

body .is-layout-flex {
    display: flex;
}

.is-layout-flex {
    flex-wrap: wrap;
    align-items: center;
}

.is-layout-flex> :is(*, div) {
    margin: 0;
}

body .is-layout-grid {
    display: grid;
}

.is-layout-grid> :is(*, div) {
    margin: 0;
}

body {
    --wp--style--root--padding-top: 0px;
    --wp--style--root--padding-right: 0;
    --wp--style--root--padding-bottom: 0px;
    --wp--style--root--padding-left: 0;
}

a:where(:not(.wp-element-button)) {
    text-decoration: underline;
}

:root :where(a:where(:not(.wp-element-button))) {
    text-decoration: none !important;
}

:root :where(.wp-element-button, .wp-block-button__link) {
    background-color: #32373c;
    border-width: 0;
    color: #fff;
    font-family: inherit;
    font-size: inherit;
    font-style: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    line-height: inherit;
    padding-top: calc(0.667em + 2px);
    padding-right: calc(1.333em + 2px);
    padding-bottom: calc(0.667em + 2px);
    padding-left: calc(1.333em + 2px);
    text-decoration: none;
    text-transform: inherit;
}

:root :where(.wp-block-heading) {
    font-family: var(--wp--preset--font-family--heading);
    font-weight: 300;
    line-height: 1.2;
    margin-top: 0;
    margin-bottom: var(--wp--preset--spacing--10);
}

:root :where(p) {
    font-family: var(--wp--preset--font-family--body);
    font-weight: 250;
    line-height: 1.4;
    margin-top: 0;
    margin-bottom: var(--wp--preset--spacing--10);
}
    `.trim();

    // 3. Block style variations
    const blockStyleVariations = `
:root :where(p.is-style-eyebrow--1) {
    font-size: var(--wp--preset--font-size--x-small);
    font-weight: 450;
    line-height: 1.2;
}

:root :where(p.is-style-eyebrow--4) {
    font-size: var(--wp--preset--font-size--x-small);
    font-weight: 450;
    line-height: 1.2;
}

:root :where(p.is-style-eyebrow--5) {
    font-size: var(--wp--preset--font-size--x-small);
    font-weight: 450;
    line-height: 1.2;
}

:root :where(p.is-style-eyebrow--7) {
    font-size: var(--wp--preset--font-size--x-small);
    font-weight: 450;
    line-height: 1.2;
}

:root :where(p.is-style-eyebrow--8) {
    font-size: var(--wp--preset--font-size--x-small);
    font-weight: 450;
    line-height: 1.2;
}
    `.trim();

    // Inject styles into document head
    const styles = [
      { id: "wp-fonts-local", content: fontStyles },
      { id: "global-styles-inline-css", content: globalStyles },
      { id: "block-style-variation-styles-inline-css", content: blockStyleVariations },
    ];

    const styleElements: HTMLStyleElement[] = [];

    styles.forEach(({ id, content }) => {
      // Check if style already exists
      const existing = document.getElementById(id);
      if (existing) {
        return; // Already loaded
      }

      const style = document.createElement("style");
      style.id = id;
      style.textContent = content;
      document.head.appendChild(style);
      styleElements.push(style);
    });

    return () => {
      // Cleanup on unmount
      styleElements.forEach((style) => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      });
    };
  }, []);

  return null;
}
