"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function useHeroAnimation({ startAnimation = false }) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtextRef = useRef<HTMLParagraphElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!startAnimation) return;

    const elements = [
      titleRef.current,
      subtextRef.current,
      buttonRef.current,
    ].filter(Boolean);

    if (elements.length > 0) {
      // Set initial hidden state
      // Animate to visible
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
      });
    }
  }, [startAnimation]);

  return {
    titleRef,
    subtextRef,
    buttonRef,
  };
}
