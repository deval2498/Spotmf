"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

interface Dimensions {
  containerWidth: number;
  containerHeight: number;
  viewBox: string;
}

interface UseLogoAnimationProps {
  onAnimationComplete?: () => void;
}

export function useLogoAnimation({
  onAnimationComplete,
}: UseLogoAnimationProps) {
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [animationState, setAnimationState] = useState("initial");
  const resizeCleanupRef = useRef(null);

  // Store the current animation timeline
  const currentAnimationRef = useRef<gsap.core.Tween | null>(null);
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  const isAnimatingRef = useRef(false);

  // Update ref when callback changes
  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  // Calculate dimensions
  const calculateDimensions = useCallback((): Dimensions | null => {
    if (typeof window === "undefined") return null;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const paddingX = width / 2;
    const paddingY = height / 2;
    const viewBox = `${-paddingX} ${-paddingY} ${width} ${height}`;

    return {
      containerWidth: width,
      containerHeight: height,
      viewBox: viewBox,
    };
  }, []);

  // Get navbar position based on current dimensions
  const getNavbarPosition = useCallback((currentDimensions: Dimensions) => {
    const logoPlaceholder = document.querySelector("#navbar-logo-placeholder");
    if (!logoPlaceholder || !currentDimensions) {
      console.warn(
        "Logo placeholder not found or no dimensions, using fallback position"
      );
      const fallbackX = currentDimensions
        ? -currentDimensions.containerWidth / 2 + 100
        : -400;
      const fallbackY = currentDimensions
        ? -currentDimensions.containerHeight / 2 + 50
        : -250;
      return { x: fallbackX, y: fallbackY };
    }

    const rect = logoPlaceholder.getBoundingClientRect();
    const svg = document.querySelector("#animated-logo-svg");
    const svgRect = svg ? svg.getBoundingClientRect() : { left: 0, top: 0 };

    // Account for navbar padding (p-2 = 8px) and logo placeholder padding
    const navbarPadding = 8; // p-2 in Tailwind
    const logoPlaceholderPadding = 8; // Additional padding in the placeholder

    // Calculate x position:
    // 1. Start from the left edge of the placeholder
    // 2. Add navbar padding
    // 3. Add logo placeholder padding
    // 4. Subtract SVG's left position to get relative position
    // 5. Subtract half container width to center the logo
    const x =
      rect.left +
      navbarPadding +
      logoPlaceholderPadding -
      svgRect.left -
      currentDimensions.containerWidth / 2 -
      16;

    // Calculate y position:
    // 1. Get the top of the placeholder
    // 2. Add half the placeholder height to get its center
    // 3. Subtract the SVG's top position to get relative position
    // 4. Subtract half the container height to center the logo
    // 5. Add a small offset to move it up slightly (adjust this value as needed)
    const y =
      rect.top +
      rect.height / 2 -
      svgRect.top -
      currentDimensions.containerHeight / 2 -
      24;

    return { x, y };
  }, []);

  // Handle resize during animation
  const handleAnimationResize = useCallback(() => {
    const newDimensions = calculateDimensions();
    if (!newDimensions) return;

    setDimensions(newDimensions);

    console.log(
      "Resize detected - State:",
      animationState,
      "IsAnimating:",
      isAnimatingRef.current,
      "HasAnimation:",
      !!currentAnimationRef.current
    );

    // Handle resize based on animation state
    if (animationState === "transitioning") {
      const logoElements = ["#WLetter", "#CircleRing"]
        .map((sel) => {
          const element = document.querySelector(sel);
          return element ? element.closest("g") || element : null;
        })
        .filter(Boolean);

      if (logoElements.length > 0) {
        // If there's an active animation, pause and kill it
        if (currentAnimationRef.current) {
          console.log("killing");
          currentAnimationRef.current.pause();
          currentAnimationRef.current.kill();
        }

        // Get the new target position
        const newTarget = getNavbarPosition(newDimensions);

        // Create a new animation from current position to updated target
        currentAnimationRef.current = gsap.to(logoElements, {
          x: newTarget.x,
          y: newTarget.y,
          duration: 1.5,
          ease: "power2.inOut",
          scale: 0.6,
          transformOrigin: "center center",
          onComplete: () => {
            console.log("Translation to navbar complete (after resize)");
            setAnimationState("complete");
            setIsAnimationComplete(true);
            currentAnimationRef.current = null;
            isAnimatingRef.current = false;
            if (onAnimationCompleteRef.current) {
              onAnimationCompleteRef.current();
            }
          },
        });
      }
    }
  }, [animationState, calculateDimensions, getNavbarPosition]);

  // Handle resize based on current state
  const handleResize = useCallback(() => {
    handleAnimationResize();
  }, [handleAnimationResize]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize dimensions
    const initialDimensions = calculateDimensions();
    if (initialDimensions) {
      setDimensions(initialDimensions);
    }

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Store cleanup function
    resizeCleanupRef.current = () => {
      window.removeEventListener("resize", handleResize);
    };

    return () => {
      if (resizeCleanupRef.current) {
        resizeCleanupRef.current();
      }
    };
  }, [handleResize, calculateDimensions]);

  // Translate to navbar function
  const translateToNavbar = useCallback(() => {
    console.log("translateToNavbar called");
    setAnimationState("transitioning");
    isAnimatingRef.current = true;

    // Small delay to ensure elements are ready
    const checkAndTranslate = () => {
      // Get fresh dimensions
      const currentDimensions = dimensions || calculateDimensions();
      if (!currentDimensions) {
        console.warn("No dimensions available for translation");
        return;
      }

      const targetPosition = getNavbarPosition(currentDimensions);

      const logoElements = ["#WLetter", "#CircleRing"]
        .map((sel) => {
          const element = document.querySelector(sel);
          return element ? element.closest("g") || element : null;
        })
        .filter(Boolean);

      console.log(
        "Found elements to translate:",
        logoElements.length,
        "targetPosition:",
        targetPosition
      );

      if (logoElements.length === 0) {
        console.warn("Elements not ready yet, retrying...");
        // Retry after a short delay if elements aren't found
        setTimeout(checkAndTranslate, 100);
        return;
      }

      // Kill any existing animation
      if (currentAnimationRef.current) {
        currentAnimationRef.current.kill();
      }

      // Create the translation animation
      currentAnimationRef.current = gsap.to(logoElements, {
        x: targetPosition.x,
        y: targetPosition.y,
        duration: 1.5,
        ease: "power2.inOut",
        scale: 0.6,
        transformOrigin: "center center",
        onComplete: () => {
          console.log("Translation to navbar complete");
          setAnimationState("complete");
          setIsAnimationComplete(true);
          currentAnimationRef.current = null;
          isAnimatingRef.current = false;
          if (onAnimationCompleteRef.current) {
            onAnimationCompleteRef.current();
          }
          //   const completedElements = ["#WLetter", "#CircleRing"]
          //     .map((sel) => {
          //       const element = document.querySelector(sel);
          //       return element ? element.closest("g") || element : null;
          //     })
          //     .filter(Boolean);

          //   if (completedElements.length > 0) {
          //     const svg = completedElements[0].closest("svg");
          //     const placeholder = document.querySelector(
          //       "#navbar-logo-placeholder"
          //     );

          //     if (svg && placeholder) {
          //       console.log("Original SVG:", svg);
          //       console.log("SVG current styles:", window.getComputedStyle(svg));

          //       // Reset SVG completely
          //       gsap.set(svg, {
          //         width: "30px",
          //         height: "30px",
          //         position: "static",
          //         transform: "none",
          //         display: "block", // Ensure it's visible
          //         opacity: 1, // Ensure it's not transparent
          //         scale: 1.1,
          //       });

          //       svg.setAttribute("viewBox", "-12 0 55 59");

          //       gsap.set(completedElements, {
          //         x: 0,
          //         y: 0,
          //         transform: "none",
          //       });

          //       // Clear placeholder and move SVG
          //       placeholder.innerHTML = "";
          //       placeholder.style.display = "flex"; // Ensure placeholder is visible
          //       placeholder.style.alignItems = "center";
          //       placeholder.style.justifyContent = "center";

          //       const child = placeholder.appendChild(svg);
          //       console.log("SVG after move:", child);
          //       console.log("Placeholder after move:", placeholder);
          //       console.log("Placeholder innerHTML:", placeholder.innerHTML);

          //       // Remove the resize listener permanently
          //       if (resizeCleanupRef.current) {
          //         console.log("Removing ref", resizeCleanupRef);
          //         resizeCleanupRef.current();
          //         resizeCleanupRef.current = null;
          //       }
          //       setAnimationState("navbar-ready");
          //     }
          //   }
        },
      });
    };

    checkAndTranslate();
  }, [dimensions, calculateDimensions, getNavbarPosition]);

  // Animation state setter for circle completion
  const setCircleAnimationState = useCallback(() => {
    setAnimationState("circle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAnimationRef.current) {
        currentAnimationRef.current.kill();
      }
    };
  }, []);

  return {
    dimensions: dimensions || {
      containerWidth: 800,
      containerHeight: 600,
      viewBox: "-400 -300 800 600",
    },
    isAnimationComplete,
    translateToNavbar,
    setCircleAnimationState,
    animationState,
  };
}
