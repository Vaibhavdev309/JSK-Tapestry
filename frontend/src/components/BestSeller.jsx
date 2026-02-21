import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "../components/ProductItem";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);
  useEffect(() => {
    const bestProduct = products.filter((item) => item.bestSeller);
    setBestSeller(bestProduct.slice(0, 6));
  }, [products]);
  return (
    <section className="px-4 sm:px-6 py-10 sm:py-12 max-w-6xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <Title text1={"Top"} text2={"Picks"} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-7 justify-items-center">
        {bestSeller.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            image={item.image}
            name={item.name}
            fluid
          />
        ))}
      </div>
    </section>
  );
};

export default BestSeller;
