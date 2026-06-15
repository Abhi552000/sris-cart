import React from "react";
import ProductCard from "./ProductCard";
import { useSelector } from "react-redux";

const BestSelller = () => {
  const products = useSelector((state) => state.products.products);

  const bestsellerProducts = products.filter((product) => product.inStock && product.bestseller);
  const displayProducts = bestsellerProducts.length > 0
    ? bestsellerProducts.slice(0, 5)
    : products.filter((product) => product.inStock).slice(0, 5);

  return (
    <div className="mt-10">
      <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
        Best Seller
      </p>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 mt-6">
        {displayProducts.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
    </div>
  );
};

export default BestSelller;
