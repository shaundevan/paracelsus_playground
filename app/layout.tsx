import type { Metadata } from "next";
import Script from "next/script";
import HeadLinks from "./head-links";
import "./globals.css";
import "../styles/wp/block-library.css";
import "../styles/wp/theme-base.css";
import "../styles/pegasus.css";

export const metadata: Metadata = {
  title: "Paracelsus Recovery",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-US"
      dir="ltr"
      className="html home wp-singular page-template-default page page-id-62825 wp-theme-pegasus"
    >
      <body className="body-main at-top modal-form">
        <HeadLinks />
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
          strategy="beforeInteractive"
        />
        <Script
          id="alpine-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('alpine:init', () => {
                Alpine.data('navigation', () => ({
                  activeMenuItem: false,
                  open: false,
                  openSearchForm: false,
                  activeSubMenuItem: false,
                  navigationIn: true,
                  atTop: true,
                  nearTop: true,
                  goingUp: false,
                  languagePromptOpen: false,
                  lastScrollY: 0,
                  init() {
                    this.lastScrollY = window.scrollY;
                    window.addEventListener('scroll', () => {
                      const currentScrollY = window.scrollY;
                      this.goingUp = currentScrollY < this.lastScrollY;
                      this.lastScrollY = currentScrollY;
                    });
                  }
                }));
                
                Alpine.data('videoBanner', () => ({
                  init() {
                    // Video banner initialization if needed
                  }
                }));
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
