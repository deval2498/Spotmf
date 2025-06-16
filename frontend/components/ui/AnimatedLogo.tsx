"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useLogoAnimation } from "../../hooks/useLogoAnimation";

gsap.registerPlugin(DrawSVGPlugin);

const getActualPosition = (selector) => {
  const element = document.querySelector(selector);
  if (!element) return { x: 0, y: 0 };

  let x = gsap.getProperty(element, "x");
  let y = gsap.getProperty(element, "y");

  if (x === 0 && y === 0) {
    const rect = element.getBoundingClientRect();
    const svg = element.closest("svg");
    const svgRect = svg ? svg.getBoundingClientRect() : { left: 0, top: 0 };

    x = rect.left - svgRect.left;
    y = rect.top - svgRect.top;
  }

  return { x, y };
};

const getPathBounds = (pathElement) => {
  try {
    const bbox = pathElement.getBBox();
    return {
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      centerX: bbox.x + bbox.width / 2,
      centerY: bbox.y + bbox.height / 2,
    };
  } catch (error) {
    console.warn("Could not get path bounds:", error);
    return { x: 0, y: 0, width: 0, height: 0, centerX: 0, centerY: 0 };
  }
};

const AnimatedLetter = ({
  pathData,
  x = 0,
  y = 0,
  delay = 0,
  strokeColor = "#f6339a",
  fillColor = "#f6339a",
  strokeWidth = 0.25,
  duration = 2,
  repeat = -1,
  yoyo = true,
  disappearAfterCycles = null,
  circleAfterCycles = null,
  circleRadius = 30,
  circleOffsetX = 0,
  circleOffsetY = 0,
  hideAfterCircle = true,
  onComplete = null,
  onCircleComplete = null, // NEW: Callback specifically for circle completion
  id = "",
}) => {
  const pathRef = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    if (!pathRef.current || !pathData) return;

    const path = pathRef.current;
    const group = groupRef.current;

    if (id && id.length > 0) {
      console.log("Setting id");
      path.setAttribute("id", id);
    }
    console.log(document.getElementById("WLetter"));

    let cycleCount = 0;
    let hasStartedCircle = false;

    const initializeAnimation = () => {
      const bounds = getPathBounds(path);

      const tl = gsap.timeline({
        repeat: repeat,
        yoyo: yoyo,
        delay: delay,
        onComplete: () => {
          console.log("Animation complete");
          if (onComplete) {
            onComplete();
          }
        },
        onRepeat: () => {
          if (yoyo) {
            cycleCount += 0.5;
          } else {
            cycleCount += 1;
          }

          // Only start circle animation once
          if (
            circleAfterCycles &&
            cycleCount >= circleAfterCycles &&
            !hasStartedCircle
          ) {
            hasStartedCircle = true;
            // Kill the timeline to stop repeating when circle starts
            tl.kill();
            startCircleAnimation(path, group, bounds);
          }

          if (disappearAfterCycles && cycleCount >= disappearAfterCycles) {
            animateDisappear(path, tl);
          }
        },
      });

      tl.to(
        path,
        {
          fill: fillColor,
          duration: duration * 0.5,
          ease: "power2.inOut",
        },
        "-=0.5"
      );
    };

    const startCircleAnimation = (path, group, bounds) => {
      console.log("Starting circle animation for letter");

      const circleCenterX = bounds.centerX + circleOffsetX - 24;
      const circleCenterY = bounds.centerY + circleOffsetY + 15;

      const svg = group.closest("svg");
      const circlePathElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );

      circlePathElement.setAttribute("fill", "none");
      circlePathElement.setAttribute("stroke", strokeColor);
      circlePathElement.setAttribute("stroke-width", strokeWidth * 8);
      circlePathElement.style.strokeLinecap = "round";
      circlePathElement.style.strokeLinejoin = "round";

      svg.appendChild(circlePathElement);

      const startAngle = -Math.PI / 2;
      const targetX = circleCenterX + Math.cos(startAngle) * circleRadius;
      const targetY = circleCenterY + Math.sin(startAngle) * circleRadius;

      gsap.to(group, {
        x: targetX - bounds.centerX,
        y: targetY - bounds.centerY,
        duration: 2,
        ease: "power2.inOut",
        onComplete: () => {
          console.log("Translation complete, starting rotation...");

          if (hideAfterCircle) {
            gsap.to(path, {
              opacity: 0,
              scale: 0,
              duration: 0.3,
            });
          }

          let angle = startAngle;
          let pathPoints = [];
          const totalRotation = Math.PI * 2;
          let rotationProgress = 0;

          const circleAnimation = () => {
            const rotationSpeed = 0.03;
            angle += rotationSpeed;
            rotationProgress += rotationSpeed;

            if (rotationProgress >= totalRotation) {
              console.log("Circle animation completed!");

              if (pathPoints.length > 0) {
                const finalPathData = createCircularPath(pathPoints, true);
                circlePathElement.setAttribute("d", finalPathData);
              }

              circlePathElement.setAttribute("id", "CircleRing");

              // IMPORTANT: Call the circle completion callback here
              if (onCircleComplete) {
                onCircleComplete();
              }
              console.log("Returning", rotationProgress);
              return;
            }

            const newX = circleCenterX + Math.cos(angle) * circleRadius;
            const newY = circleCenterY + Math.sin(angle) * circleRadius;

            gsap.set(group, {
              x: newX - bounds.centerX,
              y: newY - bounds.centerY,
            });

            pathPoints.push({ x: newX, y: newY });

            const pathData = createCircularPath(pathPoints, false);
            circlePathElement.setAttribute("d", pathData);

            requestAnimationFrame(circleAnimation);
          };
          circleAnimation();
        },
      });
    };

    const createCircularPath = (points, closePath = false) => {
      if (points.length < 2) return "";

      let pathData = `M ${points[0].x} ${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
        const curr = points[i];
        const prev = points[i - 1];

        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;

        if (i === 1) {
          pathData += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
        } else {
          pathData += ` T ${midX} ${midY}`;
        }
      }

      if (closePath && points.length > 3) {
        pathData += ` T ${points[0].x} ${points[0].y} Z`;
      }

      return pathData;
    };

    const animateDisappear = (path, timeline) => {
      gsap.to(path, {
        opacity: 0,
        scale: 0,
        duration: 0.5,
        ease: "power2.in",
        transformOrigin: "center",
        onComplete: () => {
          timeline.kill();
        },
      });
    };
    initializeAnimation();
  }, []);

  if (!pathData) {
    console.warn("No pathData provided for AnimatedLetter");
    return null;
  }

  return (
    <g ref={groupRef} transform={`translate(${x}, ${y})`}>
      <path
        ref={pathRef}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
        d={pathData}
      />
    </g>
  );
};

const AnimatedText = ({
  letters = [],
  containerWidth = 300,
  containerHeight = 300,
  viewBox = "0 0 300 300",
  strokeColor = "#f6339a",
  fillColor = "#f6339a",
  strokeWidth = 0.25,
  duration = 2,
  repeat = -1,
  yoyo = true,
  onLogoComplete = null,
  isClickable = false,
}) => {
  const handleLogoClick = () => {
    if (isClickable) {
      console.log("Logo clicked!");
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <svg
        id="animated-logo-svg"
        width={containerWidth}
        height={containerHeight}
        viewBox={viewBox}
        className={`${isClickable ? "cursor-pointer pointer-events-auto" : ""}`}
        onClick={isClickable ? handleLogoClick : undefined}
      >
        {letters.map((letter, index) => (
          <AnimatedLetter
            key={`letter-${index}`}
            {...letter}
            onCircleComplete={letter.onCircleComplete || null}
          />
        ))}
      </svg>
    </div>
  );
};

export function AnimatedLogo({ onAnimationComplete }) {
  const { dimensions, isAnimationComplete, translateToNavbar } =
    useLogoAnimation({
      onAnimationComplete,
    });

  const letterPaths = [
    {
      pathData:
        "M17.95 26.90L11.25 47L8.25 47L0 22L3.65 21.75L10 42.90L16.50 22L19.65 21.75L25.25 42.95L32.60 22L36.45 21.75L26.85 47L23.85 47L17.95 26.90Z",
      x: 0,
      y: 0,
      id: "WLetter",
      delay: 0,
      repeat: 2,
      circleAfterCycles: 2,
      circleRadius: 40,
      circleOffsetX: 0,
      circleOffsetY: 10,
      hideAfterCircle: true,
      // IMPORTANT: Use onCircleComplete instead of onComplete
    },
    {
      pathData: "M43.30 21.75L43.30 47L40.05 47L40.05 22L43.30 21.75Z",
      x: 0,
      y: 0,
      delay: 0.8,
      disappearAfterCycles: 1,
    },
    {
      pathData:
        "M41.55 15.30Q41.55 15.30 41.05 15.30Q40.55 15.30 40.02 14.65Q39.50 14 39.50 13Q39.50 12 40.08 11.38Q40.65 10.75 41.65 10.75Q42.65 10.75 43.27 11.38Q43.90 12 43.90 13.10Q43.90 14.20 43.23 14.75Q42.55 15.30 41.55 15.30Z",
      x: 0,
      y: 0,
      delay: 1.0,
      duration: 1,
      strokeColor: "#ff6b6b",
      fillColor: "#ff6b6b",
      circleAfterCycles: 2,
      circleRadius: 25,
      circleOffsetX: 0,
      circleOffsetY: 5,
      hideAfterCircle: true,
      disappearAfterCycles: 3,
      onCircleComplete: () => {
        console.log("W letter circle completed, starting translation...");
        // Add a small delay to ensure circle is fully rendered
        setTimeout(translateToNavbar, 500);
      },
    },
    {
      pathData:
        "M52.15 37.35Q48.45 35.50 48.45 30.40Q48.45 26.20 51.35 24Q54.25 21.80 58.75 21.80Q59.95 21.80 61.70 22.05L71.10 21.80L71 23.70L65.55 23.70Q68.30 25.75 68.30 29.88Q68.30 34 65.55 36.23Q62.80 38.45 58.45 38.45Q55.65 38.45 53.80 37.95Q52.85 38.85 52.85 40.05Q52.85 41.75 54.72 42.50Q56.60 43.25 59.15 43.60Q64.80 44.35 67.30 45.70Q70.90 47.70 70.90 51.85Q70.90 56 66.95 58Q63.95 59.50 59.70 59.50Q55.45 59.50 53.15 58.85Q47.10 57.10 47.10 52.35Q47.10 47.60 52.45 44.30Q50.35 42.75 50.35 40.70Q50.35 38.65 52.15 37.35M67.65 51.80Q67.65 48.55 63.35 47.30Q62.15 46.95 59.05 46.45Q55.95 45.95 54.20 45.25Q50.35 48.45 50.35 51.45Q50.35 52.75 50.75 53.60Q51.15 54.45 52.15 55.10Q54.35 56.60 58.85 56.60Q64.75 56.60 66.85 54.10Q67.65 53.15 67.65 51.80M64.90 29.75Q64.90 24.45 58.60 24.45Q55.60 24.45 53.65 25.82Q51.70 27.20 51.70 30.02Q51.70 32.85 53.10 34.33Q54.50 35.80 57.82 35.80Q61.15 35.80 63.02 34.20Q64.90 32.60 64.90 29.75Z",
      x: 0,
      y: 0,
      delay: 0.4,
      disappearAfterCycles: 1,
    },
  ];

  return (
    <AnimatedText
      letters={letterPaths}
      containerWidth={dimensions.containerWidth}
      containerHeight={dimensions.containerHeight}
      viewBox={dimensions.viewBox}
      strokeColor="#f6339a"
      fillColor="#f6339a"
      strokeWidth={0.25}
      duration={2}
      repeat={-1}
      yoyo={true}
      isClickable={isAnimationComplete}
    />
  );
}
