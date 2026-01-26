import React from "react";
import { Logo } from "../utils/icons";

const Navbar = ({ setToken, toggleSidebar, isMobile }) => {
  return (
    <div className="flex items-center justify-between bg-white shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 lg:px-6 w-full min-w-0">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
        <div className="min-w-0 flex-shrink">
          <Logo className="w-24 sm:w-[120px] lg:w-[140px] h-auto max-h-8 sm:max-h-10" />
        </div>
      </div>

      <button
        onClick={() => setToken("")}
        className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm lg:text-base transition-colors whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
