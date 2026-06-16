import React from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { toggleStock as serviceToggleStock, toggleBestseller as serviceToggleBestseller } from "../../services/productService";
import { fetchProductsThunk } from "../../store/productsSlice";
import { CURRENCY } from "../../constants";
import { RootState, AppDispatch } from "../../store";

const ProductList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: RootState) => state.products.products);
  const currency = CURRENCY;
  const fetchProducts = () => dispatch(fetchProductsThunk());
  const [togglingId, setTogglingId] = React.useState(null);
  const [togglingBestsellerId, setTogglingBestsellerId] = React.useState(null);

  const toggleStock = async (id, inStock) => {
    try {
      setTogglingId(id);
      const data = await serviceToggleStock(id, inStock);
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setTogglingId(null);
    }
  };

  const toggleBestseller = async (id, bestseller) => {
    try {
      setTogglingBestsellerId(id);
      const data = await serviceToggleBestseller(id, bestseller);
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setTogglingBestsellerId(null);
    }
  };

  return (
    <div className="flex-1 py-10 flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">All Products</h2>
        <div className="w-full overflow-x-auto rounded-md bg-white border border-gray-500/20 max-w-4xl">
          <table className="w-full min-w-[750px] border-collapse">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Product</th>
                <th className="px-4 py-3 font-semibold truncate">Category</th>
                <th className="px-4 py-3 font-semibold truncate hidden md:block">
                  Selling Price
                </th>
                <th className="px-4 py-3 font-semibold truncate">In Stock</th>
                <th className="px-4 py-3 font-semibold truncate">Bestseller</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {products.map((product, index) => (
                <tr key={product._id} className="border-t border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="border border-gray-300 rounded p-2">
                      <img
                        src={product.image[0]}
                        alt="Product"
                        className="w-16"
                      />
                    </div>
                    <span className="truncate max-sm:hidden w-full">
                      {product.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3 max-sm:hidden">
                    {currency}
                    {product.offerPrice}
                  </td>
                  <td className="px-4 py-3">
                    <label className={`relative inline-flex items-center cursor-pointer text-gray-900 gap-3 ${togglingId === product._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        disabled={togglingId === product._id}
                        onChange={() =>
                          toggleStock(product._id, !product.inStock)
                        }
                        checked={product.inStock}
                        type="checkbox"
                        className="sr-only peer"
                      />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <label className={`relative inline-flex items-center cursor-pointer text-gray-900 gap-3 ${togglingBestsellerId === product._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        disabled={togglingBestsellerId === product._id}
                        onChange={() =>
                          toggleBestseller(product._id, !product.bestseller)
                        }
                        checked={product.bestseller}
                        type="checkbox"
                        className="sr-only peer"
                      />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-amber-500 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
