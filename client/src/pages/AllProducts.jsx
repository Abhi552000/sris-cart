import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";

const AllProducts = () => {
  const products = useSelector((state) => state.products.products);
  const searchQuery = useSelector((state) => state.cart.searchQuery);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setFilteredProducts(
        products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchQuery]);
  return (
    <div className="mt-16 px-4 w-full flex flex-col">
      {/* Header components */}
      <div className="flex flex-col items-start">
        <p className="text-2xl font-medium uppercase">All Products</p>
        <div className="w-16 h-0.5 bg-primary rounded-full mt-1"></div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-6 mt-6 w-full">
        {filteredProducts
          .filter((product) => product.inStock)
          .map((product, index) => (
            <div key={index} className="min-w-0 w-full h-full">
              <ProductCard product={product} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default AllProducts;
