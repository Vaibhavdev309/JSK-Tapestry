import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [bestProducts, SetBestProducts] = useState([]);
  useEffect(() => {
    SetBestProducts(products.slice(0, 6));
  }, [products]);
  return (
    <section className="px-4 sm:px-6 py-10 sm:py-12 max-w-6xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <Title text1={"Latest"} text2={"Collections"} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
        {bestProducts.map((item, index) => (
          <ProductItem
            key={item._id}
            id={item._id}
            image={item.image}
            name={item.name}
            variant={index % 2 === 0 ? "default" : "alt"}
          />
        ))}
      </div>
    </section>
  );
};

export default LatestCollection;
