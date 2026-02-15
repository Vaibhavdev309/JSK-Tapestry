import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProduct from "../components/RelatedProduct";

const PLACEHOLDER_IMG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#e7e5e4" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#a8a29e" font-size="14" font-family="system-ui">No image</text></svg>');

const Product = () => {
  const { productId } = useParams();
  const [productData, setProductData] = useState(null);
  const { products, addToCart } = useContext(ShopContext);
  const [image, setImage] = useState("");

  useEffect(() => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      setImage(product.image?.[0] || "");
    } else if (products.length > 0) {
      setProductData(undefined);
    }
  }, [productId, products]);

  if (productData === null) {
    return (
      <main className="max-w-6xl mx-auto pt-6 sm:pt-8 pb-12 px-4 sm:px-6 min-w-0">
        <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
          <div className="flex-1 aspect-square max-w-lg bg-stone-200 rounded-2xl" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-stone-200 rounded-lg w-3/4" />
            <div className="h-4 bg-stone-100 rounded w-1/4" />
            <div className="h-4 bg-stone-100 rounded w-full" />
            <div className="h-4 bg-stone-100 rounded w-5/6" />
            <div className="h-12 bg-stone-200 rounded-xl w-32 mt-6" />
          </div>
        </div>
        <p className="text-center text-stone-500 text-sm mt-8">Loading...</p>
      </main>
    );
  }

  if (!productData) {
    return (
      <main className="max-w-2xl mx-auto pt-12 pb-16 px-4 text-center">
        <div className="card-tapestry py-14">
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Product not found</h2>
          <p className="text-stone-500 text-sm mb-6">This tapestry may have been removed or the link is incorrect.</p>
          <Link to="/collection" className="btn-primary">Browse collection</Link>
        </div>
      </main>
    );
  }

  const mainImg = image || productData.image?.[0] || PLACEHOLDER_IMG;

  return (
    <main className="max-w-6xl mx-auto pt-6 sm:pt-8 pb-12 sm:pb-16 px-4 sm:px-6 min-w-0">
      {/* Breadcrumb */}
      <nav className="mb-4 sm:mb-6" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-stone-500">
          <li><Link to="/collection" className="hover:text-amber-600 transition-colors">Collection</Link></li>
          <li aria-hidden>/</li>
          <li className="text-stone-700 font-medium truncate max-w-[12rem] sm:max-w-xs">{productData.name}</li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
        {/* Images */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="flex sm:flex-col gap-2 sm:w-20 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto pb-1 sm:pb-0 -mx-1 sm:mx-0">
            {productData.image?.map((item, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setImage(item)}
                className={`flex-shrink-0 w-14 h-14 sm:w-full sm:aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  (image || productData.image?.[0]) === item ? "border-amber-500 ring-2 ring-amber-200" : "border-stone-200 hover:border-amber-300"
                }`}
              >
                <img src={item} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} />
              </button>
            ))}
          </div>
          <div className="flex-1 aspect-square sm:aspect-auto sm:min-h-[340px] md:min-h-[400px] rounded-xl sm:rounded-2xl overflow-hidden bg-stone-100 border border-stone-100">
            <img
              className="w-full h-full object-cover"
              src={mainImg}
              alt={productData.name}
              onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 prata-regular">{productData.name}</h1>
          <p className="text-sm text-stone-500 mt-1">Handcrafted · {productData.category || "Tapestry"}{productData.subCategory ? ` · ${productData.subCategory}` : ""}</p>
          <p className="mt-4 text-stone-600 leading-relaxed">{productData.description}</p>

          <button
            type="button"
            onClick={() => {
              const defaultSize = productData.sizes?.[0];
              if (defaultSize) addToCart(productData._id, defaultSize);
            }}
            disabled={!productData.sizes?.length}
            className="btn-primary mt-6 w-full sm:w-auto px-8 py-3"
          >
            Add to cart
          </button>

          <hr className="mt-8 border-stone-200" />
          <ul className="mt-5 text-sm text-stone-600 space-y-2">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> Handpicked for quality</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> Cash on delivery available</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> We ship all over India · approx. 7 days</li>
          </ul>
        </div>
      </div>

      {/* Description */}
      <div className="mt-8 sm:mt-12 card-tapestry p-6">
        <h2 className="text-base font-semibold text-stone-800 mb-3">Description</h2>
        <p className="text-sm text-stone-600 leading-relaxed">{productData.description || "Handcrafted Indian handloom tapestry. Each piece is chosen for quality and craftsmanship."}</p>
      </div>

      <RelatedProduct
        category={productData.category}
        subCategory={productData.subCategory}
        productId={productData._id}
        sizes={productData.sizes}
      />
    </main>
  );
};

export default Product;
