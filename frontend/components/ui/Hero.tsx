/* Alternative version using CSS custom properties for even more control */
export function HeroAdvanced({ showHero = false }) {
  if (!showHero) return null;

  const heroStyles = {
    "--hero-title-size": "clamp(2.5rem, 5vw, 7rem)",
    "--hero-title-line": "clamp(2.8rem, 6vw, 7.5rem)",
    "--hero-subtitle-size": "clamp(1rem, 2.5vw, 1.25rem)",
    "--hero-subtitle-line": "clamp(1.4rem, 3vw, 1.75rem)",
    "--hero-button-padding":
      "clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)",
    "--hero-button-size": "clamp(0.9rem, 2.2vw, 1.125rem)",
    "--hero-spacing": "clamp(2rem, 5vw, 3rem)",
    "--hero-gap": "clamp(1.5rem, 4vw, 2rem)",
    "--hero-border-radius": "clamp(0.75rem, 1.5vw, 0.875rem)",
  };

  return (
    <div
      className="w-full min-h-[60vh] flex flex-col justify-center relative"
      style={heroStyles}
    >
      {/* Main heading section */}
      <div className="flex flex-col items-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <h1
            className="font-bold tracking-tight leading-tight hero-title"
            style={{
              fontSize: "var(--hero-title-size)",
              lineHeight: "var(--hero-title-line)",
            }}
          >
            <span className="text-pink-500">Simplify</span>
            <span className="text-white">&nbsp;your crypto</span>
            <br />
            <span className="text-white">investments.</span>
          </h1>
        </div>
      </div>

      {/* Subheading and CTA section */}
      <div
        className="flex flex-col sm:flex-row items-center justify-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{
          marginTop: "var(--hero-spacing)",
          gap: "var(--hero-gap)",
        }}
      >
        <p
          className="text-gray-300 text-center sm:text-left"
          style={{
            fontSize: "var(--hero-subtitle-size)",
            lineHeight: "var(--hero-subtitle-line)",
          }}
        >
          Think of it like mutual funds
          <br className="hidden sm:block" /> for cryptocurrencies
        </p>
        <button
          className="font-medium text-white border-2 border-pink-500 rounded-xl 
                       hover:bg-pink-500 hover:border-pink-500  
                       focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          style={{
            padding: "var(--hero-button-padding)",
            fontSize: "var(--hero-button-size)",
            borderRadius: "var(--hero-border-radius)",
          }}
        >
          Get Started
        </button>
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-gray-900 to-black opacity-50" />
    </div>
  );
}

import { useHeroAnimation } from "../../hooks/useHeroAnimation";
import { useRouter } from "next/navigation";

export function Hero({ showHero = false }) {
  const { titleRef, subtextRef, buttonRef } = useHeroAnimation({
    startAnimation: showHero,
  });
  const router = useRouter();

  if (!showHero) return null;

  return (
    <div className="w-full min-h-[60vh] flex flex-col justify-center ease-in-out">
      {/* Main heading section */}
      <div className="flex flex-col items-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <h1
            ref={titleRef}
            className="font-bold tracking-tight ease-in-out opacity-0"
          >
            <span
              className="text-pink-500 inline-block"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                lineHeight: "1.2",
              }}
            >
              Simplify
            </span>
            <span
              className="text-white inline-block"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                lineHeight: "1.2",
              }}
            >
              &nbsp;your crypto
            </span>
            <br />
            <span
              className="text-white inline-block"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                lineHeight: "1.2",
              }}
            >
              investments.
            </span>
          </h1>
        </div>
      </div>

      {/* Subheading and CTA section */}
      <div
        className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{
          marginTop: "clamp(2rem, 5vw, 3rem)",
          gap: "clamp(1.5rem, 4vw, 2rem)",
        }}
      >
        <p
          ref={subtextRef}
          className="text-gray-300 text-center sm:text-left opacity-0"
          style={{
            fontSize: "clamp(0.875rem, 1.2vw, 1.2rem)",
            lineHeight: "clamp(1.2rem, 2.5vw, 1.75rem)",
            maxWidth: "clamp(16rem, 35vw, 30rem)",
          }}
        >
          Think of it like mutual funds
          <br className="hidden sm:block" /> for cryptocurrencies
        </p>
        <button
          ref={buttonRef}
          onClick={() => router.push("/dashboard")}
          className="font-medium text-white border-2 border-pink-500 rounded-xl 
                     hover:bg-pink-500 hover:border-pink-500  
                     focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900
                     transform hover:scale-105 active:scale-95 opacity-0"
          style={{
            fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
            padding: "clamp(0.75rem, 1vw, 0.8rem) clamp(0.75rem, 1vw, 0.8rem)",
            borderRadius: "clamp(0.75rem, 1.5vw, 0.875rem)",
            minWidth: "clamp(8rem, 15vw, 12rem)",
            minHeight: "clamp(2.5rem, 4vw, 3.5rem)",
          }}
        >
          Get Started
        </button>
      </div>

      {/* Optional: Add a subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-gray-900 to-black opacity-50 transition-opacity" />
    </div>
  );
}
