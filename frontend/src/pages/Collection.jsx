import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { SearchIcon, CrossIcon } from "../utils/icons.jsx";

const PLACEHOLDER_IMG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#e7e5e4" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#a8a29e" font-size="12" font-family="system-ui">No image</text></svg>');

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const sizeOrder = ["1X1", "1X2", "1X3", "3X1", "2X1", "3X3", "6X6"];
const typeOrder = [
  "Buddha",
  "Ganesh ji",
  "Holi",
  "Hunting",
  "Jhula",
  "Lakshmi Ji",
  "Raash Leela",
  "Radha Krishna gaay",
];

const ChevronDown = ({ open, className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`${className} text-stone-500 transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const Collection = () => {
  const { products, search, setSearch } = useContext(ShopContext);
  const filterDropdownRef = useRef(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState(false);
  const [openSizeDropdown, setOpenSizeDropdown] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [pendingCategory, setPendingCategory] = useState([]);
  const [pendingSubCategory, setPendingSubCategory] = useState([]);
  const [sortType, setSortType] = useState("Size");

  // When opening the filter dropdown, sync pending state from applied filters
  useEffect(() => {
    if (showFilter) {
      setPendingCategory([...category]);
      setPendingSubCategory([...subCategory]);
    }
  }, [showFilter]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    if (showFilter) {
      document.addEventListener("click", handleClickOutside, true);
      return () => document.removeEventListener("click", handleClickOutside, true);
    }
  }, [showFilter]);

  const togglePendingCategory = (e) => {
    const value = e.target.value;
    setPendingCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const togglePendingSubCategory = (e) => {
    const value = e.target.value;
    setPendingSubCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const applyFiltersFromDialog = () => {
    setCategory(pendingCategory);
    setSubCategory(pendingSubCategory);
    setShowFilter(false);
  };

  const clearPendingFilters = () => {
    setPendingCategory([]);
    setPendingSubCategory([]);
  };

  const applyFilter = () => {
    let filtered = products;

    if (search && search.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      filtered = filtered.filter((item) => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      filtered = filtered.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    setFilterProducts(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [products, search, category, subCategory]);

  const getGroupedData = () => {
    const rows =
      sortType === "Type"
        ? typeOrder.filter(
            (type) =>
              filterProducts.some((p) => p.category === type) &&
              (category.length === 0 || category.includes(type))
          )
        : sizeOrder.filter(
            (size) =>
              filterProducts.some((p) => p.subCategory === size) &&
              (subCategory.length === 0 || subCategory.includes(size))
          );

    const columns = sortType === "Type" ? sizeOrder : typeOrder;

    return { rows, columns };
  };

  const { rows, columns } = getGroupedData();
  const hasActiveFilters = category.length > 0 || subCategory.length > 0;
  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white">
      <div className="flex flex-col gap-4 sm:gap-6 pt-6 sm:pt-8 pb-12 sm:pb-16 px-4 sm:px-6 max-w-7xl mx-auto min-w-0">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search Bar */}
          {showSearch && (
            <div className="mb-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white border border-stone-200 rounded-lg focus-within:ring-2 focus-within:ring-amber-500/40 focus-within:border-amber-500 transition-all">
                  <SearchIcon className="w-5 h-5 shrink-0 text-stone-400" aria-hidden="true" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    placeholder="Search tapestries..."
                    className="flex-1 min-w-0 outline-none bg-transparent text-stone-800 placeholder-stone-400 text-sm"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSearch(false);
                    setSearch("");
                  }}
                  className="p-2 text-stone-500 hover:text-amber-600 transition-colors rounded-lg hover:bg-stone-100"
                  aria-label="Close search"
                >
                  <CrossIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <Title text1="All" text2="Collections" />
              {filterProducts.length > 0 && (
                <p className="text-stone-500 text-sm mt-1">
                  {filterProducts.length} tapestry{filterProducts.length !== 1 ? "s" : ""}
                  {hasActiveFilters && (
                    <> · <button type="button" onClick={clearFilters} className="text-amber-600 hover:text-amber-700 font-medium">Clear filters</button></>
                  )}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 rounded-xl bg-white text-stone-700 hover:bg-stone-50 transition-colors"
                aria-label="Toggle search"
              >
                <SearchIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>

              {/* Filters dropdown - full width on mobile so dropdown can span */}
              <div ref={filterDropdownRef} className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFilter((prev) => !prev);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl bg-white text-stone-700 transition-all duration-200 ${
                    showFilter ? "border-amber-400 ring-2 ring-amber-500/20 bg-amber-50/50" : "border-stone-200 hover:bg-stone-50"
                  }`}
                  aria-expanded={showFilter}
                  aria-haspopup="true"
                >
                  <FilterIcon />
                  <span>Filters</span>
                  {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                  <ChevronDown open={showFilter} className="w-4 h-4 ml-0.5" />
                </button>

                {/* Dropdown panel - responsive: full-width on mobile, fixed max on tablet+ */}
                <div
                  className={`absolute right-0 left-0 sm:left-auto top-full z-50 mt-2 w-full min-w-[16rem] max-w-[calc(100vw-2rem)] sm:w-80 sm:max-w-[20rem] origin-top-right rounded-2xl border border-stone-200/80 bg-white shadow-xl shadow-stone-200/50 transition-all duration-200 ease-out ${
                    showFilter
                      ? "scale-100 opacity-100 visible"
                      : "scale-95 opacity-0 invisible pointer-events-none"
                  }`}
                  role="dialog"
                  aria-label="Filter by category and size"
                >
                  <div className="max-h-[min(80vh,26rem)] sm:max-h-[min(85vh,28rem)] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-stone-100 bg-stone-50/50 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 text-amber-700">
                          <FilterIcon />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-stone-800 tracking-tight">Refine results</h2>
                          {(pendingCategory.length > 0 || pendingSubCategory.length > 0) ? (
                            <p className="text-xs text-stone-500 mt-0.5">
                              {pendingCategory.length + pendingSubCategory.length} selected
                            </p>
                          ) : (
                            <p className="text-xs text-stone-500 mt-0.5">Category & size</p>
                          )}
                        </div>
                      </div>
                      {(pendingCategory.length > 0 || pendingSubCategory.length > 0) && (
                        <button
                          type="button"
                          onClick={clearPendingFilters}
                          className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 space-y-1">
                      {/* Category collapsible */}
                      <section className="rounded-xl border border-stone-100 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setOpenCategoryDropdown((prev) => !prev)}
                          className="w-full flex items-center justify-between gap-2 px-4 py-3.5 sm:py-3 text-left bg-stone-50/80 hover:bg-stone-100/80 active:bg-stone-100 transition-colors duration-200 min-h-[2.75rem] sm:min-h-0 touch-manipulation"
                          aria-expanded={openCategoryDropdown}
                        >
                          <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1 h-3 rounded-full bg-amber-500" aria-hidden />
                            Category
                          </span>
                          <ChevronDown open={openCategoryDropdown} />
                        </button>
                        <div
                          className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
                            openCategoryDropdown ? "max-h-[18rem] sm:max-h-[320px]" : "max-h-0"
                          }`}
                        >
                          <div className="space-y-0.5 p-2 border-t border-stone-100">
                              {typeOrder.map((type) => {
                                const isChecked = pendingCategory.includes(type);
                                return (
                                  <label
                                    key={type}
                                    className={`flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-lg cursor-pointer transition-colors duration-150 touch-manipulation min-h-[2.5rem] sm:min-h-0 ${
                                      isChecked ? "bg-white text-stone-900 shadow-sm border border-stone-200/80" : "text-stone-600 hover:bg-white/60 hover:text-stone-800"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      value={type}
                                      checked={isChecked}
                                      onChange={togglePendingCategory}
                                      className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-0"
                                    />
                                    <span className="text-sm font-medium">{type}</span>
                                  </label>
                                );
                              })}
                            </div>
                        </div>
                      </section>

                      {/* Size collapsible */}
                      <section className="rounded-xl border border-stone-100 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setOpenSizeDropdown((prev) => !prev)}
                          className="w-full flex items-center justify-between gap-2 px-4 py-3.5 sm:py-3 text-left bg-stone-50/80 hover:bg-stone-100/80 active:bg-stone-100 transition-colors duration-200 min-h-[2.75rem] sm:min-h-0 touch-manipulation"
                          aria-expanded={openSizeDropdown}
                        >
                          <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1 h-3 rounded-full bg-amber-500" aria-hidden />
                            Size
                          </span>
                          <ChevronDown open={openSizeDropdown} />
                        </button>
                        <div
                          className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
                            openSizeDropdown ? "max-h-[18rem] sm:max-h-[320px]" : "max-h-0"
                          }`}
                        >
                          <div className="space-y-0.5 p-2 border-t border-stone-100">
                              {sizeOrder.map((size) => {
                                const isChecked = pendingSubCategory.includes(size);
                                return (
                                  <label
                                    key={size}
                                    className={`flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-lg cursor-pointer transition-colors duration-150 touch-manipulation min-h-[2.5rem] sm:min-h-0 ${
                                      isChecked ? "bg-white text-stone-900 shadow-sm border border-stone-200/80" : "text-stone-600 hover:bg-white/60 hover:text-stone-800"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      value={size}
                                      checked={isChecked}
                                      onChange={togglePendingSubCategory}
                                      className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-0"
                                    />
                                    <span className="text-sm font-medium">{size}</span>
                                  </label>
                                );
                              })}
                            </div>
                        </div>
                      </section>
                    </div>

                    <div className="shrink-0 px-4 py-3 sm:px-5 sm:py-4 border-t border-stone-100 bg-stone-50/30">
                      <button
                        type="button"
                        onClick={applyFiltersFromDialog}
                        className="w-full min-h-[2.75rem] sm:min-h-[2.5rem] py-3 px-4 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 active:scale-[0.99] touch-manipulation"
                      >
                        Apply filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-stone-200 rounded-xl bg-white text-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none sm:w-44"
              >
                <option value="Type">Sort by type</option>
                <option value="Size">Sort by size</option>
              </select>
            </div>
          </div>

          <div className="space-y-8">
            {rows.length === 0 ? (
              <div className="card-tapestry flex flex-col items-center justify-center py-14 sm:py-16 px-6 text-center">
                <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-1">No tapestries match your filters</h3>
                <p className="text-stone-500 text-sm max-w-sm mb-6">Try different categories or sizes, or clear filters to see the full collection.</p>
                <button type="button" onClick={clearFilters} className="btn-secondary">
                  Clear filters
                </button>
              </div>
            ) : (
              rows.map((row) => (
                <section key={row} className="card-tapestry p-4 sm:p-6">
                  <h3 className="text-base font-semibold text-stone-800 mb-4 prata-regular border-b border-stone-100 pb-3">{row}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {columns
                      .filter((col) =>
                        filterProducts.some((p) =>
                          sortType === "Type"
                            ? p.category === row && p.subCategory === col
                            : p.subCategory === row && p.category === col
                        )
                      )
                      .map((col) => {
                        const productsInCell = filterProducts.filter((p) =>
                          sortType === "Type"
                            ? p.category === row && p.subCategory === col
                            : p.subCategory === row && p.category === col
                        );
                        const firstProduct = productsInCell[0];
                        const imgSrc = firstProduct?.image?.[0] || PLACEHOLDER_IMG;
                        const name = firstProduct?.name || "Tapestry";

                        return (
                          <Link
                            key={`${row}-${col}`}
                            to={`/collection/${sortType === "Type" ? row : col}/${sortType === "Type" ? col : row}`}
                            className="group block rounded-xl overflow-hidden border border-stone-100 bg-stone-50/50 hover:border-stone-200 hover:shadow-card-hover transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 min-w-0"
                          >
                            <div className="aspect-square bg-stone-100 overflow-hidden">
                              <img
                                src={imgSrc}
                                alt={name}
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                              />
                            </div>
                            <div className="p-4 text-center">
                              <p className="text-sm sm:text-base font-medium text-stone-800 tracking-tight leading-snug line-clamp-2 px-1">{name}</p>
                              <p className="text-xs text-stone-500 mt-2">{productsInCell.length} variant{productsInCell.length !== 1 ? "s" : ""}</p>
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Collection;
