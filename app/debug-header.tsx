"use client";

import { useEffect } from "react";

export default function DebugHeader() {
  useEffect(() => {
    // Check if header element exists in DOM
    const header = document.querySelector("#page-header");
    const headerDiv = document.querySelector("#page > div:first-child");
    
    console.log("=== HEADER DEBUG INFO ===");
    console.log("Header element (#page-header):", header);
    console.log("Header wrapper div:", headerDiv);
    
    if (headerDiv) {
      console.log("Header wrapper innerHTML length:", headerDiv.innerHTML.length);
      console.log("Header wrapper first 200 chars:", headerDiv.innerHTML.substring(0, 200));
    }
    
    if (header) {
      console.log("Header found! Classes:", header.className);
      console.log("Header children count:", header.children.length);
    } else {
      console.error("❌ Header element NOT FOUND in DOM!");
      console.log("Available elements in #page:", document.querySelector("#page")?.children);
    }
    
    // Check for Alpine.js
    console.log("Alpine available:", typeof window !== "undefined" && (window as any).Alpine);
    
    // Check for navigation data
    if (typeof window !== "undefined" && (window as any).Alpine) {
      console.log("Alpine.data('navigation'):", (window as any).Alpine.data("navigation"));
    }
  }, []);

  return null;
}
