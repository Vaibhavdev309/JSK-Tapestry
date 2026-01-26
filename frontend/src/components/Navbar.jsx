import { useState, useEffect, useRef, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { Logo, ProfileIcon, CartIcon } from "../utils/icons.jsx";
import { ShopContext } from "../context/ShopContext.jsx";

export default function Navbar() {
  const {
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
  } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const prevVisibleRef = useRef(false);

  // Lock body scroll when mobile menu is open; focus close when opening, menu when closing
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      closeButtonRef.current?.focus();
      prevVisibleRef.current = true;
      return () => {
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
      };
    } else {
      if (prevVisibleRef.current) menuButtonRef.current?.focus();
      prevVisibleRef.current = false;
    }
  }, [visible]);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setVisible(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Escape to close mobile menu
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setVisible(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!profileOpen) return;
    const onClose = () => setProfileOpen(false);
    document.addEventListener("click", onClose);
    return () => document.removeEventListener("click", onClose);
  }, [profileOpen]);

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    setVisible(false);
  };

  const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 text-sm font-medium transition-colors ${
      isActive ? "text-amber-600" : "text-stone-600 hover:text-amber-600"
    }`;

  return (
    <>
    <nav className="sticky top-0 z-50 flex items-center justify-between gap-2 py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 border-b border-stone-100 bg-white/95 backdrop-blur-sm w-full min-w-0 relative">
      {/* Logo */}
      <Link to="/" className="shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 rounded min-w-0">
        <Logo className="w-20 sm:w-28 md:w-32 lg:w-36 h-auto max-h-8 sm:max-h-10 md:max-h-none" />
      </Link>

      {/* Desktop nav */}
      <ul className="hidden sm:flex items-center gap-1 lg:gap-2 shrink-0">
        <li>
          <NavLink to="/" className={navLinkClass}>
            <span className="whitespace-nowrap">Home</span>
            <hr className="h-0.5 w-6 bg-amber-600 rounded-full border-0 hidden" aria-hidden />
          </NavLink>
        </li>
        <li>
          <NavLink to="/collection" className={navLinkClass}>
            <span className="whitespace-nowrap">Collection</span>
            <hr className="h-0.5 w-6 bg-amber-600 rounded-full border-0 hidden" aria-hidden />
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={navLinkClass}>
            <span className="whitespace-nowrap">About</span>
            <hr className="h-0.5 w-6 bg-amber-600 rounded-full border-0 hidden" aria-hidden />
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={navLinkClass}>
            <span className="whitespace-nowrap">Contact</span>
            <hr className="h-0.5 w-6 bg-amber-600 rounded-full border-0 hidden" aria-hidden />
          </NavLink>
        </li>
      </ul>

      {/* Icons */}
      <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">
        {token ? (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setProfileOpen((v) => !v); }}
              className="p-2.5 sm:p-1.5 text-stone-600 hover:text-amber-600 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 touch-manipulation"
              aria-label="Account menu"
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              <ProfileIcon className="w-5 h-5" />
            </button>
            <div className={`absolute right-0 top-full pt-2 transition-all z-50 ${profileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>
              <div className="min-w-[10rem] py-2 bg-white border border-stone-200 rounded-xl shadow-lg">
                <button
                  type="button"
                  onClick={() => { navigate("/profile"); setProfileOpen(false); setVisible(false); }}
                  className="block w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                >
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => { navigate("/orders"); setProfileOpen(false); setVisible(false); }}
                  className="block w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                >
                  Orders
                </button>
                <button
                  type="button"
                  onClick={() => { logout(); setProfileOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors border-t border-stone-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link
            to="/login"
            className="p-2.5 sm:p-1.5 text-stone-600 hover:text-amber-600 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 touch-manipulation"
            aria-label="Log in"
          >
            <ProfileIcon className="w-5 h-5" />
          </Link>
        )}

        <Link
          to="/cart"
          className="relative p-2.5 sm:p-1.5 text-stone-600 hover:text-amber-600 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 touch-manipulation"
          aria-label={`Cart, ${getCartCount()} items`}
        >
          <CartIcon className="w-5 h-5" />
          {getCartCount() > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 flex items-center justify-center bg-amber-600 text-white text-[10px] font-semibold rounded-full">
              {getCartCount()}
            </span>
          )}
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setVisible(true)}
          className="sm:hidden p-2 text-stone-600 hover:text-amber-600 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 touch-manipulation -mr-1"
          aria-label="Open menu"
          aria-expanded={visible}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

    </nav>
    
    {/* Mobile menu - rendered outside nav for proper z-index stacking */}
    {visible && (
      <>
        {/* Backdrop overlay with fade-in animation */}
        <div
          className={`fixed inset-0 bg-stone-900/50 z-[10000] sm:hidden transition-opacity duration-300 ease-out ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setVisible(false)}
          aria-hidden="true"
        />
        
        {/* Menu panel with slide-in animation */}
        <div
          className="fixed top-0 right-0 h-full w-[min(100vw,20rem)] bg-white shadow-2xl z-[10001] sm:hidden flex flex-col animate-slide-in-right"
        >
            {/* Header with fade-in animation */}
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-white animate-fade-in">
              <span className="text-lg font-semibold text-stone-800">Menu</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setVisible(false)}
                className="p-2 -m-2 text-stone-500 hover:text-amber-600 rounded-lg transition-all duration-200 hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Menu items with staggered slide-in animation */}
            <div className="flex flex-col flex-1 overflow-y-auto py-2">
              <NavLink
                to="/"
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `px-4 py-3.5 text-base text-stone-700 hover:bg-amber-50 transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:scale-[1.02] animate-slide-in-left ${
                    isActive ? "bg-amber-50 text-amber-700 font-medium border-l-4 border-amber-500" : ""
                  }`
                }
                style={{ animationDelay: '0.05s', animationFillMode: 'both' }}
              >
                Home
              </NavLink>
              <NavLink
                to="/collection"
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `px-4 py-3.5 text-base text-stone-700 hover:bg-amber-50 transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:scale-[1.02] animate-slide-in-left ${
                    isActive ? "bg-amber-50 text-amber-700 font-medium border-l-4 border-amber-500" : ""
                  }`
                }
                style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
              >
                Collection
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `px-4 py-3.5 text-base text-stone-700 hover:bg-amber-50 transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:scale-[1.02] animate-slide-in-left ${
                    isActive ? "bg-amber-50 text-amber-700 font-medium border-l-4 border-amber-500" : ""
                  }`
                }
                style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
              >
                About
              </NavLink>
              <NavLink
                to="/contact"
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `px-4 py-3.5 text-base text-stone-700 hover:bg-amber-50 transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:scale-[1.02] animate-slide-in-left ${
                    isActive ? "bg-amber-50 text-amber-700 font-medium border-l-4 border-amber-500" : ""
                  }`
                }
                style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
              >
                Contact
              </NavLink>
              {token && (
                <>
                  <div 
                    className="my-2 mx-4 border-t border-stone-200 animate-fade-in" 
                    style={{ animationDelay: '0.25s', animationFillMode: 'both' }} 
                  />
                  <button
                    type="button"
                    onClick={() => { navigate("/orders"); setVisible(false); }}
                    className="px-4 py-3.5 text-left text-base text-stone-700 hover:bg-amber-50 transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:scale-[1.02] animate-slide-in-left"
                    style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
                  >
                    Orders
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="px-4 py-3.5 text-left text-base text-stone-700 hover:bg-amber-50 transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:scale-[1.02] animate-slide-in-left"
                    style={{ animationDelay: '0.35s', animationFillMode: 'both' }}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
