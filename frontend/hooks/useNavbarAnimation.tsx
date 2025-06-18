"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function useNavbarAnimation({ startAnimation = false }) {
  const menuItemsRef = useRef([]);
  const socialButtonsRef = useRef([]);
  const launchButtonRef = useRef(null);

  useEffect(() => {
    if (!startAnimation) return;

    const menuItems = menuItemsRef.current.filter(Boolean);

    if (menuItems.length > 0) {
      // Set initial hidden state
      gsap.set(menuItems, { opacity: 0, y: -20 });

      // Animate to visible
      gsap.to(menuItems, {
        opacity: 1,
        duration: 0.5,
        y: 0,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }, [startAnimation]);

  const addToMenuRefs = (el) => {
    if (el && !menuItemsRef.current.includes(el)) {
      menuItemsRef.current.push(el);
    }
  };

  return {
    addToMenuRefs,
  };
}
