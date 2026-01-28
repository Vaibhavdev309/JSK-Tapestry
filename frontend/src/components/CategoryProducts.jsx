import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";

const PLACEHOLDER_IMG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#e7e5e4" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#a8a29e" font-size="14" font-family="system-ui">No image</text></svg>');

const LENS_SIZE = 160;

const CategoryProducts = () => {
  const { category, subCategory, productId } = useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useContext(ShopContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
      const onKey = (e) => { if (e.key === "Escape") setLightboxOpen(false); };
      document.addEventListener("keydown", onKey);
      return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  const filteredProducts = products.filter(
    (p) => p.category === category && p.subCategory === subCategory
  );

  // Track previous productId to only reset image when product actually changes
  const prevProductIdRef = useRef(productId);

  useEffect(() => {
    const filteredProducts = products.filter(
      (p) => p.category === category && p.subCategory === subCategory
    );
    
    console.log("🔄 useEffect triggered:", { 
      productId, 
      prevProductId: prevProductIdRef.current, 
      filteredProductsCount: filteredProducts.length,
      productsCount: products.length,
    });
    
    if (productId) {
      const product = filteredProducts.find((p) => p._id === productId);
      if (product) {
        const productChanged = prevProductIdRef.current !== productId;
        console.log("📦 Product found:", { 
          productId, 
          productName: product.name, 
          imageCount: product.image?.length || 0,
          productChanged,
          currentMainImage: mainImage,
          firstImage: product.image?.[0],
        });
        
        setSelectedProduct(product);
        
        // Only reset mainImage if the product actually changed (different productId)
        if (productChanged) {
          console.log("🔄 Product changed - resetting mainImage to first image");
          setMainImage(product.image?.[0] || "");
          setShowMagnifier(false); // Reset zoom when product changes
        } else {
          console.log("✅ Same product - keeping current mainImage:", mainImage);
          // If mainImage is empty but product has images, set it
          if (!mainImage && product.image?.[0]) {
            console.log("⚠️ mainImage was empty, setting to first image");
            setMainImage(product.image[0]);
          }
        }
        
        prevProductIdRef.current = productId;
      } else if (filteredProducts.length > 0) {
        console.log("⚠️ Product not found, navigating to first product");
        navigate(`/collection/${category}/${subCategory}/${filteredProducts[0]._id}`, { replace: true });
      }
    } else if (filteredProducts.length > 0) {
      console.log("⚠️ No productId, navigating to first product");
      navigate(`/collection/${category}/${subCategory}/${filteredProducts[0]._id}`, { replace: true });
    }
  }, [productId, category, subCategory, navigate, products]); // Use products instead of filteredProducts

  // Reset zoom when main image changes (but only if not mobile)
  useEffect(() => {
    if (!isMobile && mainImage) {
      console.log("🔍 Main image changed, resetting zoom:", mainImage);
      setShowMagnifier(false);
    }
  }, [mainImage, isMobile]);

  // Debug: Log mainImage changes
  useEffect(() => {
    console.log("🖼️ mainImage state changed:", mainImage);
  }, [mainImage]);

  const handleVariantSelect = (id) => {
    navigate(`/collection/${category}/${subCategory}/${id}`);
    setSelectedSize("");
  };

  const handleMouseMove = (e) => {
    if (isMobile || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mx = Math.max(0, Math.min(x, rect.width));
    const my = Math.max(0, Math.min(y, rect.height));
    setMagnifierPosition({ x: mx, y: my });
  };

  const isLoading = products.length === 0 && selectedProduct === null;
  const isEmpty = products.length > 0 && filteredProducts.length === 0;
  const isWaiting = !productId && filteredProducts.length > 0;

  if (isLoading || (isWaiting && !selectedProduct)) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="h-8 w-48 bg-stone-200 rounded-lg animate-pulse mb-8" />
          <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
            <div className="flex-1 aspect-square max-w-md bg-stone-200 rounded-2xl" />
            <div className="flex-1 space-y-4">
              <div className="h-7 bg-stone-200 rounded w-3/4" />
              <div className="h-4 bg-stone-100 rounded w-full" />
              <div className="h-4 bg-stone-100 rounded w-5/6" />
              <div className="h-10 bg-stone-200 rounded-xl w-28 mt-6" />
            </div>
          </div>
          <p className="text-center text-stone-500 text-sm mt-8">Loading...</p>
        </div>
      </main>
    );
  }

  if (isEmpty) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="card-tapestry py-14">
            <h2 className="text-lg font-semibold text-stone-800 mb-2">No products in this category</h2>
            <p className="text-stone-500 text-sm mb-6">We couldn’t find any tapestries for {category} ({subCategory}).</p>
            <Link to="/collection" className="btn-primary">View all collections</Link>
          </div>
        </div>
      </main>
    );
  }

  if (!selectedProduct) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12 min-w-0">
        {/* Breadcrumb + Header */}
        <nav className="mb-5 sm:mb-6" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-stone-500 mb-3">
            <li><Link to="/collection" className="hover:text-amber-600 transition-colors">Collection</Link></li>
            <li aria-hidden className="text-stone-300">/</li>
            <li><span className="text-stone-700">{category}</span></li>
            <li aria-hidden className="text-stone-300">/</li>
            <li><span className="text-stone-700 font-medium">{subCategory}</span></li>
          </ol>
          <h1 className="text-lg sm:text-xl font-bold text-stone-900 prata-regular">
            {category} <span className="text-stone-500 font-normal">— {subCategory}</span>
          </h1>
        </nav>

        {/* Mobile Variants */}
        <div className="block lg:hidden mb-6">
          <h2 className="text-sm font-semibold text-stone-800 mb-3">Variants</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1">
            {filteredProducts.map((product) => (
              <button
                type="button"
                key={product._id}
                onClick={() => handleVariantSelect(product._id)}
                className={`text-left p-2.5 rounded-xl border-2 transition-all flex-shrink-0 w-[120px] ${
                  selectedProduct._id === product._id
                    ? "border-amber-500 bg-amber-50/80 shadow-sm"
                    : "border-stone-200 hover:border-amber-300 bg-white"
                }`}
              >
                <ProductItem {...product} compact />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Desktop Variants */}
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <h2 className="text-base font-semibold text-stone-800 mb-4 pb-2 border-b border-stone-200">
              Variants
            </h2>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredProducts.map((product) => (
                <button
                  type="button"
                  key={product._id}
                  onClick={() => handleVariantSelect(product._id)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedProduct._id === product._id
                      ? "border-amber-500 bg-amber-50/80 shadow-sm"
                      : "border-stone-200 hover:border-amber-300 bg-white"
                  }`}
                >
                  <ProductItem {...product} compact />
                </button>
              ))}
            </div>
          </aside>

          {/* Product Details */}
          <section className="flex-1 min-w-0 overflow-visible">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Images - Amazon style: thumbnails left, main image right */}
              <div className="lg:w-[50%] flex-shrink-0 overflow-visible">
                <div className="w-full lg:sticky lg:top-24">
                  <div className="flex flex-row lg:flex-row gap-3 lg:gap-4">
                    {/* Thumbnails - Left side (desktop) / Top (mobile) */}
                    {selectedProduct.image && selectedProduct.image.length > 1 && (
                      <div className="hidden lg:flex flex-col gap-2.5 flex-shrink-0 max-h-[500px] overflow-y-auto pr-1">
                        {selectedProduct.image.map((img, index) => {
                          const isSelected = mainImage === img || (!mainImage && index === 0);
                          return (
                            <button
                              key={img}
                              type="button"
                              onClick={() => {
                                console.log("🖼️ Thumbnail clicked:", { 
                                  imageIndex: index, 
                                  imageUrl: img,
                                  currentMainImage: mainImage,
                                  willChange: mainImage !== img,
                                });
                                setMainImage(img);
                                setShowMagnifier(false); // Reset zoom when changing image
                                console.log("✅ mainImage state updated to:", img);
                              }}
                              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-1 flex-shrink-0 ${
                                isSelected
                                  ? "border-amber-500 ring-2 ring-amber-200/80"
                                  : "border-stone-200 hover:border-amber-300"
                              }`}
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Main Image Container */}
                    <div className="flex-1 min-w-0 relative">
                      <div
                        className="relative w-full aspect-square max-h-[min(340px,88vw)] sm:max-h-[440px] lg:max-h-none lg:aspect-auto lg:h-[500px] rounded-lg overflow-hidden bg-stone-100 border border-stone-200"
                        onMouseEnter={() => !isMobile && setShowMagnifier(true)}
                        onMouseLeave={() => !isMobile && setShowMagnifier(false)}
                        onMouseMove={handleMouseMove}
                        onClick={() => isMobile && setLightboxOpen(true)}
                        onKeyDown={(e) => isMobile && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setLightboxOpen(true))}
                        role={isMobile ? "button" : undefined}
                        tabIndex={isMobile ? 0 : undefined}
                        aria-label={isMobile ? "Tap to zoom" : undefined}
                        ref={imageRef}
                      >
                        <img
                          key={mainImage || selectedProduct.image?.[0]}
                          src={mainImage || selectedProduct.image?.[0] || PLACEHOLDER_IMG}
                          alt={selectedProduct.name}
                          className="w-full h-full object-contain select-none transition-opacity duration-200"
                          draggable={false}
                          onLoad={() => {
                            const currentImg = mainImage || selectedProduct.image?.[0];
                            console.log("✅ Image loaded successfully:", currentImg);
                          }}
                          onError={(e) => { 
                            console.error("❌ Image failed to load:", mainImage || selectedProduct.image?.[0]);
                            e.target.onerror = null; 
                            e.target.src = PLACEHOLDER_IMG; 
                          }}
                        />
                        {/* Desktop: overlay zoom lens (2x) - small circle on image */}
                        {!isMobile && showMagnifier && imageRef.current && (() => {
                          const currentImg = mainImage || selectedProduct.image?.[0];
                          if (!currentImg) return null;
                          const w = imageRef.current.offsetWidth;
                          const h = imageRef.current.offsetHeight;
                          if (w <= 0 || h <= 0) return null;
                          const left = Math.max(0, Math.min(magnifierPosition.x - LENS_SIZE / 2, w - LENS_SIZE));
                          const top = Math.max(0, Math.min(magnifierPosition.y - LENS_SIZE / 2, h - LENS_SIZE));
                          return (
                            <div
                              className="absolute pointer-events-none rounded-full border-2 border-white/90 shadow-xl overflow-hidden z-10"
                              style={{
                                left: `${left}px`,
                                top: `${top}px`,
                                width: LENS_SIZE,
                                height: LENS_SIZE,
                                backgroundImage: `url(${currentImg})`,
                                backgroundSize: `${w * 2}px ${h * 2}px`,
                                backgroundPosition: `${LENS_SIZE / 2 - magnifierPosition.x * 2}px ${LENS_SIZE / 2 - magnifierPosition.y * 2}px`,
                              }}
                            />
                          );
                        })()}
                        {isMobile && (
                          <div className="absolute bottom-3 right-3 rounded-lg bg-black/50 text-white/90 px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                            Tap to zoom
                          </div>
                        )}
                        {!isMobile && showMagnifier && (
                          <div className="absolute bottom-3 right-3 rounded-lg bg-black/50 text-white/90 px-2.5 py-1.5 text-xs font-medium">2.5× zoom</div>
                        )}
                      </div>
                      {/* Desktop: Amazon-style zoom panel on the right */}
                      {!isMobile && showMagnifier && imageRef.current && (() => {
                        const currentImg = mainImage || selectedProduct.image?.[0];
                        if (!currentImg) return null;
                        const w = imageRef.current.offsetWidth;
                        const h = imageRef.current.offsetHeight;
                        if (w <= 0 || h <= 0) return null;
                        const zoomPanelSize = 400;
                        const zoomFactor = 2.5;
                        return (
                          <div
                            className="absolute left-full ml-4 top-0 w-[400px] h-[500px] rounded-lg overflow-hidden border border-stone-200 bg-white shadow-2xl pointer-events-none z-20 hidden xl:block"
                            style={{
                              backgroundImage: `url(${currentImg})`,
                              backgroundSize: `${w * zoomFactor}px ${h * zoomFactor}px`,
                              backgroundPosition: `${zoomPanelSize / 2 - magnifierPosition.x * zoomFactor}px ${zoomPanelSize / 2 - magnifierPosition.y * zoomFactor}px`,
                              backgroundRepeat: "no-repeat",
                            }}
                          />
                        );
                      })()}

                      {/* Mobile: Thumbnails below main image */}
                      {selectedProduct.image && selectedProduct.image.length > 1 && (
                        <div className="flex lg:hidden gap-2 overflow-x-auto mt-3 pb-1 -mx-0.5">
                          {selectedProduct.image.map((img, index) => {
                            const isSelected = mainImage === img || (!mainImage && index === 0);
                            return (
                              <button
                                key={img}
                                type="button"
                                onClick={() => {
                                  console.log("🖼️ Mobile thumbnail clicked:", { 
                                    imageIndex: index, 
                                    imageUrl: img,
                                    currentMainImage: mainImage,
                                    willChange: mainImage !== img,
                                  });
                                  setMainImage(img);
                                  setShowMagnifier(false); // Reset zoom when changing image
                                  console.log("✅ mainImage state updated to:", img);
                                }}
                                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-1 ${
                                  isSelected
                                    ? "border-amber-500 ring-2 ring-amber-200/80"
                                    : "border-stone-200 hover:border-amber-300"
                                }`}
                              >
                                <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile / tablet: lightbox */}
                {lightboxOpen && (
                  <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image zoom"
                  >
                    <button
                      type="button"
                      className="absolute inset-0 w-full h-full cursor-default z-0"
                      onClick={() => setLightboxOpen(false)}
                      aria-label="Close zoom"
                    />
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(false)}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                      aria-label="Close"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <img
                      key={mainImage || selectedProduct.image?.[0]}
                      src={mainImage || selectedProduct.image?.[0] || PLACEHOLDER_IMG}
                      alt={selectedProduct.name}
                      className="relative z-10 max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
                      onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                    />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="lg:w-[50%] flex flex-col min-w-0">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl lg:text-[1.65rem] font-bold text-stone-900 mb-2 prata-regular leading-tight">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-stone-500 text-sm mb-6">
                    {category} · {subCategory}
                  </p>
                  <p className="text-stone-600 leading-relaxed mb-6 text-[15px]">
                    {selectedProduct.description}
                  </p>

                  {/* Size Selection */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-stone-800 mb-3 uppercase tracking-wide">
                      Select Size
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes?.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[4rem] px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 ${
                            selectedSize === size
                              ? "border-amber-500 bg-amber-50 text-amber-800 shadow-sm"
                              : "border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50/50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add to Cart & policies */}
                <div className="space-y-5 pt-5 sm:pt-6 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => selectedSize && addToCart(selectedProduct._id, selectedSize)}
                    disabled={!selectedSize}
                    className={`w-full py-3.5 rounded-xl text-[15px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                      selectedSize ? "btn-primary" : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
                    }`}
                  >
                    {selectedSize ? "Add to cart" : "Select a size first"}
                  </button>
                  <ul className="space-y-2.5 text-sm text-stone-600">
                    <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> 100% pure silk, handpicked for quality</li>
                    <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> Cash on delivery available</li>
                    <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> Easy 7-day return & exchange</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Back */}
        <div className="mt-10 pt-6 border-t border-stone-200">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/collection");
              }
            }}
            className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-600 font-medium text-sm transition-colors"
          >
            <span aria-hidden>←</span> Back
          </button>
          <Link
            to="/collection"
            className="ml-4 inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-600 font-medium text-sm transition-colors"
          >
            Collection
          </Link>
        </div>
      </div>
    </main>
  );
};

export default CategoryProducts;
