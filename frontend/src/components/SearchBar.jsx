import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { SearchIcon, CrossIcon } from "../utils/icons.jsx";
import { useLocation } from "react-router-dom";

const SearchBar = () => {
  const { search, showSearch, setSearch, setShowSearch } =
    useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("collection")) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location]);

  if (!showSearch || !visible) return null;

  return (
    <div className="border-y border-stone-200 bg-stone-50/90 py-4 px-2 sm:px-4">
      <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
        <div className="flex items-center gap-3 w-full min-w-0 px-3 sm:px-4 py-2.5 bg-white border border-stone-200 rounded-xl shadow-card focus-within:ring-2 focus-within:ring-amber-500/40 focus-within:border-amber-500 transition-all">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search tapestries..."
            className="flex-1 min-w-0 outline-none bg-transparent text-stone-800 placeholder-stone-400 text-sm"
            autoFocus
          />
          <SearchIcon className="w-4 h-4 shrink-0 text-stone-400" aria-hidden="true" />
        </div>
        <button
          type="button"
          onClick={() => setShowSearch(false)}
          className="p-1.5 text-stone-500 hover:text-amber-600 transition-colors rounded-lg"
          aria-label="Close search"
        >
          <CrossIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
