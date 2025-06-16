"use client";
import { useState } from "react";
import { FiGithub } from "react-icons/fi";
import { FaDiscord } from "react-icons/fa";
import { MdOutlineLightMode } from "react-icons/md";
import { useNavbarAnimation } from "../../hooks/useNavbarAnimation";

export function Navbar({ showNavbar = false }) {
  const { launchButtonRef, addToMenuRefs, addToSocialRefs } =
    useNavbarAnimation({
      startAnimation: showNavbar,
    });

  if (!showNavbar) {
    return (
      <div className="absolute inset-x-0">
        <div className="max-w-5xl mx-auto rounded-2xl mt-2 text-white">
          <div className="p-2">
            <div className="flex justify-between items-center">
              {/* Logo placeholder - this is where the animated logo will land */}
              <div
                id="navbar-logo-placeholder"
                className="w-16 h-8 flex items-center justify-center"
              >
                {/* Empty placeholder for logo */}
              </div>
              <div className="opacity-0">Hidden content</div>
              <div className="opacity-0">Hidden content</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-0">
      <div className="max-w-5xl mx-auto rounded-2xl mt-2 text-white">
        <div className="p-2">
          <div className="flex justify-between items-center">
            {/* Logo area - the animated logo will be positioned here */}
            <div
              id="navbar-logo-placeholder"
              className="w-16 h-8 flex items-center justify-center"
            >
              {/* The animated SVG will be positioned over this */}
            </div>

            {/* Menu items */}
            <div className="flex gap-5 text-sm text-gray-300">
              <div
                ref={addToMenuRefs}
                className="hover:text-orange-300 hover:cursor-pointer transition-colors duration-200"
              >
                How it works?
              </div>
              <div
                ref={addToMenuRefs}
                className="hover:text-orange-300 hover:cursor-pointer transition-colors duration-200"
              >
                Explore Strategies
              </div>
              <div
                ref={addToMenuRefs}
                className="hover:text-orange-300 hover:cursor-pointer transition-colors duration-200"
              >
                Why its safe?
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex gap-5">
              <div className="flex gap-3">
                <button
                  ref={addToSocialRefs}
                  className="hover:scale-110 transition-transform duration-200 p-1"
                >
                  <FiGithub stroke="#d1d5dc" cursor="pointer" size={18} />
                </button>
                <button
                  ref={addToSocialRefs}
                  className="hover:scale-110 transition-transform duration-200 p-1"
                >
                  <FaDiscord fill="#d1d5dc" cursor="pointer" size={18} />
                </button>
                <button
                  ref={addToSocialRefs}
                  className="hover:scale-110 transition-transform duration-200 p-1"
                >
                  <MdOutlineLightMode
                    fill="#d1d5dc"
                    cursor="pointer"
                    size={18}
                  />
                </button>
              </div>

              <button
                ref={launchButtonRef}
                className="border border-pink-500 px-4 py-2 rounded-xl hover:cursor-pointer hover:bg-pink-500 transition-all duration-200 font-medium"
              >
                Launch App
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
