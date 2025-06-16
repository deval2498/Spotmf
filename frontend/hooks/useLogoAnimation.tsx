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

    const x = rect.left - svgRect.left - currentDimensions.containerWidth / 2;
    const y = rect.top - svgRect.top - currentDimensions.containerHeight / 2;

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
    } else if (animationState === "complete") {
      // If animation is complete, just update the final position
      const completedElements = ["#WLetter", "#CircleRing"]
        .map((sel) => {
          const element = document.querySelector(sel);
          return element ? element.closest("g") || element : null;
        })
        .filter(Boolean);

      if (completedElements.length > 0) {
        const newTarget = getNavbarPosition(newDimensions);
        gsap.set(completedElements, {
          x: newTarget.x,
          y: newTarget.y,
        });
      }
    }
  }, [animationState, calculateDimensions, getNavbarPosition]);

  // Handle resize based on current state
  const handleResize = useCallback(() => {
    // Handle resize immediately for all states
    handleAnimationResize();
  }, [handleAnimationResize]);

  // Initialize dimensions and set up resize listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize dimensions
    const initialDimensions = calculateDimensions();
    if (initialDimensions) {
      setDimensions(initialDimensions);
    }

    // Add resize listener
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
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
