import React, { useContext, useEffect, useState } from "react";
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
  "Ganesha",
  "Lakshmi",
  "Radha",
  "Radha Krishna",
  "Hunting",
  "Holi",
];

const Collection = () => {
  const { products, search, setSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("Type");

  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
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
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 pb-12 sm:pb-16 px-4 sm:px-6 max-w-7xl mx-auto min-w-0">
        {/* Filters Sidebar */}
        <aside
          className={`lg:w-72 shrink-0 ${
            showFilter ? "fixed inset-0 z-40 lg:relative lg:block" : "hidden lg:block"
          }`}
        >
          <div className="h-full lg:h-auto flex flex-col lg:sticky lg:top-24 pt-20 px-4 pb-4 lg:pt-0 lg:px-0 lg:pb-0">
            {/* Mobile backdrop */}
            {showFilter && (
              <div
                className="fixed inset-0 bg-stone-900/40 z-[-1] lg:hidden"
                onClick={() => setShowFilter(false)}
                aria-hidden="true"
              />
            )}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-soft lg:shadow-card p-5 max-h-[85vh] overflow-y-auto lg:max-h-[calc(100vh-7rem)]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-stone-800">Filters</h2>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowFilter(false)}
                    className="lg:hidden p-2 -m-2 rounded-lg hover:bg-stone-100 text-stone-500"
                    aria-label="Close filters"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-stone-800 mb-3">Category</h3>
                  <div className="space-y-2">
                    {typeOrder.map((type) => (
                      <label key={type} className="flex items-center gap-3 text-sm text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          value={type}
                          checked={category.includes(type)}
                          onChange={toggleCategory}
                          className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border-t border-stone-100 pt-5">
                  <h3 className="text-sm font-semibold text-stone-800 mb-3">Size</h3>
                  <div className="space-y-2">
                    {sizeOrder.map((size) => (
                      <label key={size} className="flex items-center gap-3 text-sm text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          value={size}
                          checked={subCategory.includes(size)}
                          onChange={toggleSubCategory}
                          className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0"
                        />
                        <span>{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

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
              <button
                type="button"
                onClick={() => setShowFilter(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-stone-200 rounded-xl bg-white text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <FilterIcon />
                Filters
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
              </button>
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
                  <div className="grid grid-cols-2 min-[500px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                              />
                            </div>
                            <div className="p-3">
                              <p className="text-sm font-medium text-stone-800 truncate">{name}</p>
                              <p className="text-xs text-stone-500 mt-1">{productsInCell.length} variant{productsInCell.length !== 1 ? "s" : ""}</p>
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
