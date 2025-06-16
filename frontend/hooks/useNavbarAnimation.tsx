"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function useNavbarAnimation({ startAnimation = false }) {
  const menuItemsRef = useRef([]);
  const socialButtonsRef = useRef([]);
  const launchButtonRef = useRef(null);

  useEffect(() => {
    if (!startAnimation) return;

    // Small delay to ensure refs are populated
    const timer = setTimeout(() => {
      const menuItems = menuItemsRef.current.filter(Boolean);
      const socialButtons = socialButtonsRef.current.filter(Boolean);
      const launchButton = launchButtonRef.current;

      // Set initial hidden state
      if (menuItems.length > 0) {
        gsap.set(menuItems, { opacity: 0, y: -20 });
      }
      if (socialButtons.length > 0) {
        gsap.set(socialButtons, { opacity: 0, y: -20 });
      }
      if (launchButton) {
        gsap.set(launchButton, { opacity: 0, y: -20 });
      }

      // Create timeline
      const tl = gsap.timeline();

      // Animate menu items first
      if (menuItems.length > 0) {
        tl.to(menuItems, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        });
      }

      // Animate social buttons
      if (socialButtons.length > 0) {
        tl.to(
          socialButtons,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.2"
        );
      }

      // Animate launch button
      if (launchButton) {
        tl.to(
          launchButton,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.3"
        );
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [startAnimation]);

  const addToMenuRefs = (el) => {
    if (el && !menuItemsRef.current.includes(el)) {
      menuItemsRef.current.push(el);
    }
  };

  const addToSocialRefs = (el) => {
    if (el && !socialButtonsRef.current.includes(el)) {
      socialButtonsRef.current.push(el);
    }
  };

  return {
    launchButtonRef,
    addToMenuRefs,
    addToSocialRefs,
  };
}
