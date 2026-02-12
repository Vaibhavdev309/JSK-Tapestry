import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const RelatedProduct = ({ category, subCategory, productId, sizes = [] }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length === 0) return;
    let pCopy = products.filter((item) => item._id !== productId && item.category === category);
    // Same category and at least one size (dimension) in common
    if (Array.isArray(sizes) && sizes.length > 0) {
      pCopy = pCopy.filter((item) =>
        item.sizes && item.sizes.some((s) => sizes.includes(s))
      );
    }
    // If no same-dimension matches, fall back to same category + same subCategory
    if (pCopy.length === 0 && subCategory) {
      pCopy = products.filter(
        (item) => item._id !== productId && item.category === category && item.subCategory === subCategory
      );
    }
    setRelated(pCopy.slice(0, 5));
  }, [products, category, subCategory, productId, sizes]);

  return (
    <section className="bg-stone-50/80 py-10 sm:py-12 mt-12 sm:mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <Title text1="Related" text2="Products" />
          <p className="mt-2 text-stone-600 text-sm sm:text-base">
            Same category &amp; size options
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {related.map((item, index) => (
            <ProductItem
              key={item._id || index}
              id={item._id}
              name={item.name}
              image={item.image}
            />
          ))}
        </div>
        {related.length === 0 && (
          <div className="text-center text-stone-500 py-8">
            <p>No related products found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RelatedProduct;
