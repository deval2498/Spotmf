"use client";
import { useState } from "react";
import { FiGithub } from "react-icons/fi";
import { FaDiscord } from "react-icons/fa";
import { MdOutlineLightMode } from "react-icons/md";
import { useNavbarAnimation } from "../../hooks/useNavbarAnimation";
import { useRouter } from "next/navigation";

export function Navbar({ showNavbar = false }) {
  const { addToMenuRefs } = useNavbarAnimation({
    startAnimation: showNavbar,
  });
  const router = useRouter();

  if (!showNavbar) {
    return (
      <div className="absolute inset-x-0">
        <div className="max-w-5xl mx-auto rounded-2xl mt-2 text-white">
          <div className="p-2">
            <div className="flex justify-between items-center">
              {/* Logo placeholder - this is where the animated logo will land */}
              <div
                id="navbar-logo-placeholder"
                className="flex items-center justify-center"
              ></div>
              <div className="opacity-0">Hidden content</div>
              <div className="opacity-0">Hidden content</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky inset-x-0">
      <div className="max-w-5xl mx-auto rounded-2xl mt-2 text-white">
        <div className="p-2">
          <div className="flex justify-between items-center">
            {/* Logo area - the animated logo will be positioned here */}
            <div
              id="navbar-logo-placeholder"
              className="flex items-center justify-center"
            ></div>

            {/* Menu items */}
            <div className="flex gap-5 text-sm text-gray-300">
              <div
                ref={addToMenuRefs}
                className="hover:text-orange-300 cursor-pointer opacity-0"
              >
                How it works?
              </div>
              <div
                ref={addToMenuRefs}
                className="hover:text-orange-300 cursor-pointer opacity-0"
              >
                Explore Strategies
              </div>
              <div
                ref={addToMenuRefs}
                className="hover:text-orange-300 cursor-pointer opacity-0"
              >
                Why its safe?
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex gap-5">
              <div className="flex gap-3">
                <button ref={addToMenuRefs} className="p-1 opacity-0 group">
                  <FiGithub
                    className="stroke-gray-300 group-hover:stroke-orange-400 transition-colors duration-200"
                    size={18}
                  />
                </button>
                <button ref={addToMenuRefs} className="p-1 opacity-0 group">
                  <FaDiscord
                    className="fill-gray-300 group-hover:fill-orange-400 transition-colors duration-200"
                    size={18}
                  />
                </button>
                <button ref={addToMenuRefs} className="p-1 opacity-0 group">
                  <MdOutlineLightMode
                    className="fill-gray-300 group-hover:fill-orange-400 transition-colors duration-200"
                    size={18}
                  />
                </button>
              </div>

              <button
                ref={addToMenuRefs}
                onClick={() => router.push("/dashboard")}
                className="border border-pink-500 px-4 py-2 rounded-xl cursor-pointer hover:bg-pink-500 font-medium opacity-0"
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
