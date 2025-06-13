"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

// Register the plugin
gsap.registerPlugin(DrawSVGPlugin);

// Individual letter component
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
  disappearAfterCycles = null, // Number of complete cycles before disappearing
  circleAfterCycles = null, // Number of cycles before starting circle animation
  circleRadius = 20, // Radius of the circle movement
  onComplete = null,
}) => {
  const pathRef = useRef(null);

  useEffect(() => {
    if (!pathRef.current || !pathData) return;

    const path = pathRef.current;
    let cycleCount = 0;
    let hasStartedCircle = false;

    // Create timeline for coordinated animations (same as your original)
    const tl = gsap.timeline({
      repeat: repeat,
      yoyo: yoyo,
      delay: delay,
      onComplete: () => {
        if (onComplete) onComplete();
      },
      onRepeat: () => {
        // Count complete cycles (forward + backward = 1 cycle when yoyo is true)
        if (yoyo) {
          cycleCount += 0.5; // Half cycle each repeat
        } else {
          cycleCount += 1; // Full cycle each repeat
        }

        // Check if we should start circle animation
        if (
          circleAfterCycles &&
          cycleCount >= circleAfterCycles &&
          !hasStartedCircle
        ) {
          hasStartedCircle = true;

          // Stop the main timeline
          tl.pause();

          // Fill the dot immediately when circle starts
          gsap.to(path, {
            fill: fillColor,
            drawSVG: "100%",
            duration: 0.5,
            ease: "power2.inOut",
          });

          // Create dot motion along the circle
          // GET CURRENT POSITION OF THE DOT
          const currentX = gsap.getProperty(path, "x") || 0;
          const currentY = gsap.getProperty(path, "y") || 0;

          console.log("Current dot position:", currentX, currentY);

          // Calculate the circle center
          const centerX = x;
          const centerY = y;
          const circleCenterX = centerX - 23;
          const circleCenterY = centerY + 20;

          // Calculate the actual current position in world coordinates
          const actualCurrentX = centerX + currentX;
          const actualCurrentY = centerY + currentY;

          console.log("Actual world position:", actualCurrentX, actualCurrentY);
          console.log("Circle center:", circleCenterX, circleCenterY);

          // Calculate the angle from circle center to current dot position
          const currentAngle =
            Math.atan2(
              actualCurrentY - circleCenterY,
              actualCurrentX - circleCenterX
            ) + 150;

          console.log("Starting angle:", currentAngle);

          const svg = path.closest("svg");
          const circlePathElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );

          // Set up the circle path
          circlePathElement.setAttribute("fill", "none");
          circlePathElement.setAttribute("stroke", strokeColor);
          circlePathElement.setAttribute("stroke-width", "4");
          circlePathElement.style.strokeLinecap = "round";
          circlePathElement.style.strokeLinejoin = "round";

          // Add to SVG
          svg.appendChild(circlePathElement);

          // STEP 1: TRANSLATE TO CIRCLE EDGE FROM CURRENT POSITION
          const targetX = circleCenterX + Math.cos(currentAngle) * circleRadius;
          const targetY = circleCenterY + Math.sin(currentAngle) * circleRadius;

          gsap.to(path, {
            x: targetX - centerX,
            y: targetY - centerY,
            duration: 3, // 1 second to translate to circle edge
            ease: "power2.inOut",
            onComplete: () => {
              //STEP 2: START ROTATION FROM CURRENT ANGLE
              let angle = currentAngle; // Start from where we are now
              const startAngle = currentAngle;
              let pathPoints = []; // Store path points for progressive drawing
              gsap.to(path, {
                opacity: 0,
                scale: 0,
                duration: 0.2,
              });
              const circleAnimation = () => {
                angle += 0.02; // Speed of rotation
                const angleTraveled = angle - startAngle;

                // Check if we've completed a full circle (2π radians = 360 degrees)
                if (angleTraveled >= Math.PI * 2) {
                  console.log("Full circle completed! Stopping animation.");
                  return; // Stop the animation
                }
                // Calculate new position
                const newX = circleCenterX + Math.cos(angle) * circleRadius;
                const newY = circleCenterY + Math.sin(angle) * circleRadius;

                // Move the dot
                gsap.set(path, {
                  x: newX - centerX,
                  y: newY - centerY,
                });

                // Add current point to path
                pathPoints.push({ x: newX + 41.5, y: newY + 14 });

                // Create path string from all points
                if (pathPoints.length > 1) {
                  let pathData = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
                  for (let i = 1; i < pathPoints.length; i++) {
                    pathData += ` L ${pathPoints[i].x} ${pathPoints[i].y}`;
                  }
                  circlePathElement.setAttribute("d", pathData);
                }

                // Keep only recent points to prevent memory issues
                if (pathPoints.length > 360) {
                  pathPoints = pathPoints.slice(-100);
                }

                console.log("Angle:", angle, "Points:", pathPoints.length);

                requestAnimationFrame(circleAnimation);
              };

              // Start the circular animation from current position
              circleAnimation();
            },
          });

          return; // Don't check for disappear if we're circling
        }

        // Check if we should disappear
        if (disappearAfterCycles && cycleCount >= disappearAfterCycles) {
          // Animate out (fade and scale down)
          gsap.to(path, {
            opacity: 0,
            scale: 0,
            duration: 0.5,
            ease: "power2.in",
            transformOrigin: "center",
            onComplete: () => {
              tl.kill(); // Stop the main timeline
            },
          });
        }
      },
    });

    // Your exact animation logic
    tl.fromTo(
      path,
      {
        drawSVG: "0%",
        fill: "transparent",
      },
      {
        drawSVG: "100%",
        duration: duration,
        ease: "power2.inOut",
      }
    ).to(
      path,
      {
        fill: fillColor,
        duration: duration * 0.5,
        ease: "power2.inOut",
      },
      "-=0.5"
    ); // Start fill animation 0.5s before stroke completes
  }, [
    pathData,
    delay,
    strokeColor,
    fillColor,
    duration,
    repeat,
    yoyo,
    disappearAfterCycles,
    circleAfterCycles,
    circleRadius,
    onComplete,
  ]);

  if (!pathData) {
    console.warn("No pathData provided for AnimatedLetter");
    return null;
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
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

// Main component for animated text
const AnimatedText = ({
  letters = [], // Array of objects: [{ pathData: "M...", x: 0, y: 0, delay: 0, disappearAfterCycles: 2 }]
  containerWidth = 300,
  containerHeight = 300,
  viewBox = "0 0 300 300",
  strokeColor = "#f6339a",
  fillColor = "#f6339a",
  strokeWidth = 0.25,
  duration = 2,
  repeat = -1,
  yoyo = true,
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <svg
          width={containerWidth}
          height={containerHeight}
          viewBox={viewBox}
          className=""
        >
          {letters.map((letter, index) => (
            <AnimatedLetter
              key={`letter-${index}`}
              pathData={letter.pathData}
              x={letter.x || 0}
              y={letter.y || 0}
              delay={letter.delay || 0}
              strokeColor={letter.strokeColor || strokeColor}
              fillColor={letter.fillColor || fillColor}
              strokeWidth={letter.strokeWidth || strokeWidth}
              duration={letter.duration || duration}
              repeat={letter.repeat !== undefined ? letter.repeat : repeat}
              yoyo={letter.yoyo !== undefined ? letter.yoyo : yoyo}
              disappearAfterCycles={letter.disappearAfterCycles || null}
              circleAfterCycles={letter.circleAfterCycles || false}
              circleRadius={letter.circleRadius || 30}
              onComplete={letter.onComplete || null}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

// Demo component showing how to use it
export function SimpleBall() {
  // Your letter paths with proper positioning
  const letterPaths = [
    {
      pathData:
        "M17.95 26.90L11.25 47L8.25 47L0 22L3.65 21.75L10 42.90L16.50 22L19.65 21.75L25.25 42.95L32.60 22L36.45 21.75L26.85 47L23.85 47L17.95 26.90Z", // W
      x: 0,
      y: 0,
      delay: 0,
      repeat: 2,
    },
    {
      pathData: "M43.30 21.75L43.30 47L40.05 47L40.05 22L43.30 21.75Z", // I STICK - main vertical line
      x: 0,
      y: 0,
      delay: 0.8,
      disappearAfterCycles: 2,
    },
    // I - DOT (the dot above the "i")
    {
      pathData:
        "M41.55 15.30Q41.55 15.30 41.05 15.30Q40.55 15.30 40.02 14.65Q39.50 14 39.50 13Q39.50 12 40.08 11.38Q40.65 10.75 41.65 10.75Q42.65 10.75 43.27 11.38Q43.90 12 43.90 13.10Q43.90 14.20 43.23 14.75Q42.55 15.30 41.55 15.30Z", // I DOT - the small circle above
      x: 0, // Same x position as stick
      y: 0, // Same y position as stick
      delay: 1.0, // Delayed after stick

      // You can add custom animations for the dot:
      duration: 1, // Faster animation
      strokeColor: "#ff6b6b", // Different color for the dot
      fillColor: "#ff6b6b",
      circleAfterCycles: true,
    },
    {
      pathData:
        "M52.15 37.35Q48.45 35.50 48.45 30.40Q48.45 26.20 51.35 24Q54.25 21.80 58.75 21.80Q59.95 21.80 61.70 22.05L71.10 21.80L71 23.70L65.55 23.70Q68.30 25.75 68.30 29.88Q68.30 34 65.55 36.23Q62.80 38.45 58.45 38.45Q55.65 38.45 53.80 37.95Q52.85 38.85 52.85 40.05Q52.85 41.75 54.72 42.50Q56.60 43.25 59.15 43.60Q64.80 44.35 67.30 45.70Q70.90 47.70 70.90 51.85Q70.90 56 66.95 58Q63.95 59.50 59.70 59.50Q55.45 59.50 53.15 58.85Q47.10 57.10 47.10 52.35Q47.10 47.60 52.45 44.30Q50.35 42.75 50.35 40.70Q50.35 38.65 52.15 37.35M67.65 51.80Q67.65 48.55 63.35 47.30Q62.15 46.95 59.05 46.45Q55.95 45.95 54.20 45.25Q50.35 48.45 50.35 51.45Q50.35 52.75 50.75 53.60Q51.15 54.45 52.15 55.10Q54.35 56.60 58.85 56.60Q64.75 56.60 66.85 54.10Q67.65 53.15 67.65 51.80M64.90 29.75Q64.90 24.45 58.60 24.45Q55.60 24.45 53.65 25.82Q51.70 27.20 51.70 30.02Q51.70 32.85 53.10 34.33Q54.50 35.80 57.82 35.80Q61.15 35.80 63.02 34.20Q64.90 32.60 64.90 29.75Z", // G
      x: 0,
      y: 0,
      delay: 0.4,
      disappearAfterCycles: 1.5,
    },
    {
      pathData:
        "M17.95 26.90L11.25 47L8.25 47L0 22L3.65 21.75L10 42.90L16.50 22L19.65 21.75L25.25 42.95L32.60 22L36.45 21.75L26.85 47L23.85 47L17.95 26.90Z", // W
      x: 75,
      y: 0,
      delay: 0.6,
      disappearAfterCycles: 1.5,
    },
    {
      pathData:
        "M0.55 24.70Q6 22 10.10 21.85Q13.35 21.85 15.13 22.67Q16.90 23.50 18 24.97Q19.10 26.45 19.10 29.10L19.10 47L15.85 47L15.85 45.10Q9 47.20 7.05 47.20Q6.95 47.20 6.90 47.20Q2.40 47.20 0.75 44.45Q0.15 43.45 0.08 42.50Q0 41.55 0 40.90Q0 39.10 1.40 37.67Q2.80 36.25 4.75 35.75Q8.05 34.90 15.85 34.25L15.85 30.20Q15.85 24.75 10.15 24.75Q6.15 24.75 1.45 27.10L0.55 24.70M3.05 41.30Q3.05 44.90 8 44.90Q11.95 44.90 15.85 43.20L15.85 36.05Q8.05 37.15 6.20 37.75Q3.05 38.75 3.05 41.30Z",
      x: 115,
      y: 0,
      delay: 0.8,
      disappearAfterCycles: 1.5,
    },
    {
      pathData:
        "M52.15 37.35Q48.45 35.50 48.45 30.40Q48.45 26.20 51.35 24Q54.25 21.80 58.75 21.80Q59.95 21.80 61.70 22.05L71.10 21.80L71 23.70L65.55 23.70Q68.30 25.75 68.30 29.88Q68.30 34 65.55 36.23Q62.80 38.45 58.45 38.45Q55.65 38.45 53.80 37.95Q52.85 38.85 52.85 40.05Q52.85 41.75 54.72 42.50Q56.60 43.25 59.15 43.60Q64.80 44.35 67.30 45.70Q70.90 47.70 70.90 51.85Q70.90 56 66.95 58Q63.95 59.50 59.70 59.50Q55.45 59.50 53.15 58.85Q47.10 57.10 47.10 52.35Q47.10 47.60 52.45 44.30Q50.35 42.75 50.35 40.70Q50.35 38.65 52.15 37.35M67.65 51.80Q67.65 48.55 63.35 47.30Q62.15 46.95 59.05 46.45Q55.95 45.95 54.20 45.25Q50.35 48.45 50.35 51.45Q50.35 52.75 50.75 53.60Q51.15 54.45 52.15 55.10Q54.35 56.60 58.85 56.60Q64.75 56.60 66.85 54.10Q67.65 53.15 67.65 51.80M64.90 29.75Q64.90 24.45 58.60 24.45Q55.60 24.45 53.65 25.82Q51.70 27.20 51.70 30.02Q51.70 32.85 53.10 34.33Q54.50 35.80 57.82 35.80Q61.15 35.80 63.02 34.20Q64.90 32.60 64.90 29.75Z", // G
      x: 90,
      y: 0,
      delay: 1,
      disappearAfterCycles: 1.5,
    },
    // Add more letters here...
  ];

  return (
    <AnimatedText
      letters={letterPaths}
      containerWidth={300}
      containerHeight={300}
      viewBox="-50 -50 300 300"
      strokeColor="#f6339a"
      fillColor="#f6339a"
      strokeWidth={0.25}
      duration={2}
      repeat={-1}
      yoyo={true}
    />
  );
}
