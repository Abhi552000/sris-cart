import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { ChefHat, ShoppingBag, Clock, Check } from "lucide-react";

const RecipeBundles = () => {
  const { products, addToCart } = useAppContext();
  const [addingRecipe, setAddingRecipe] = useState(null);

  // Recipes configuration with search terms to resolve from active products
  const recipes = [
    {
      id: "healthy-breakfast",
      name: "Quick Healthy Breakfast",
      tag: "Diet & Fitness",
      time: "10 Mins",
      color: "from-emerald-500 to-teal-600",
      description: "Fuel your day with fresh milk, farm eggs, whole wheat bread, and ripe bananas.",
      ingredients: [
        { name: "Amul Milk 1L", search: "Amul Milk 1L" },
        { name: "Eggs 12 pcs", search: "Eggs 12 pcs" },
        { name: "Brown Bread 400g", search: "Brown Bread 400g" },
        { name: "Banana 1 kg", search: "Banana 1 kg" },
      ]
    },
    {
      id: "gourmet-grains",
      name: "Gourmet Grains Bowl",
      tag: "Pantry Staples",
      time: "15 Mins",
      color: "from-amber-500 to-orange-600",
      description: "A nutritious blend of premium basmati rice, organic barley, and wholesome brown rice.",
      ingredients: [
        { name: "Basmati Rice 5kg", search: "Basmati Rice 5kg" },
        { name: "Barley 1kg", search: "Barley 1kg" },
        { name: "Brown Rice 1kg", search: "Brown Rice 1kg" },
      ]
    },
    {
      id: "sweet-treats",
      name: "Afternoon Sweet Treat",
      tag: "Bakery Special",
      time: "5 Mins",
      color: "from-blue-500 to-indigo-600",
      description: "Indulge in a premium chocolate cake, freshly baked butter croissant, and refreshing Coca-Cola.",
      ingredients: [
        { name: "Chocolate Cake 500g", search: "Chocolate Cake 500g" },
        { name: "Butter Croissant 100g", search: "Butter Croissant 100g" },
        { name: "Coca-Cola 1.5L", search: "Coca-Cola 1.5L" },
      ]
    }
  ];

  // Helper to resolve product from name search term
  const getProduct = (searchTerm) => {
    if (!products || products.length === 0) return null;
    return products.find((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleAddBundle = async (recipe) => {
    // Collect all resolved, in-stock products
    const itemsToAdd = [];
    let hasOutOfStock = false;

    recipe.ingredients.forEach((ing) => {
      const prod = getProduct(ing.search);
      if (prod) {
        if (prod.inStock) {
          itemsToAdd.push(prod);
        } else {
          hasOutOfStock = true;
        }
      }
    });

    if (itemsToAdd.length === 0) {
      toast.error("No ingredients are currently available for this recipe.");
      return;
    }

    try {
      setAddingRecipe(recipe.id);
      // Simulate quick batching delay for feedback
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Batch add items to cart
      itemsToAdd.forEach((item) => {
        addToCart(item._id);
      });

      if (hasOutOfStock) {
        toast.success(`Recipe added! (Some out-of-stock items were skipped)`);
      } else {
        toast.success(`All ingredients for ${recipe.name} added to cart!`);
      }
    } catch {
      toast.error("Failed to add bundle to cart.");
    } finally {
      setAddingRecipe(null);
    }
  };

  return (
    <div className="mt-20">
      {/* Header */}
      <div className="flex flex-col items-start mb-10">
        <div className="flex items-center gap-2 text-primary">
          <ChefHat className="w-6 h-6 animate-bounce" />
          <span className="text-sm font-bold uppercase tracking-widest">Smart Kitchen</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">
          Smart Recipes & <span className="text-primary bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Instant Bundles</span>
        </h2>
        <div className="w-16 h-1 bg-primary rounded-full mt-2"></div>
        <p className="text-gray-500 text-sm mt-3 max-w-xl">
          Cook your favorite meals effortlessly. Add all the fresh ingredients needed for these mouthwatering recipes directly to your shopping cart in just one tap!
        </p>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe) => {
          const resolvedIngredients = recipe.ingredients
            .map((ing) => ({
              ...ing,
              product: getProduct(ing.search)
            }))
            .filter((ing) => ing.product !== null); // Only show available store products

          if (resolvedIngredients.length === 0) return null;

          return (
            <div
              key={recipe.id}
              className="group bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Card Banner */}
              <div className={`bg-gradient-to-br ${recipe.color} p-6 text-white relative`}>
                <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {recipe.tag}
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <Clock className="w-4 h-4 text-white/80" />
                  <span className="text-xs text-white/80 font-medium">{recipe.time} Prep</span>
                </div>
                <h3 className="text-2xl font-bold mt-2 leading-tight">{recipe.name}</h3>
                <p className="text-xs text-white/70 mt-2 line-clamp-2">
                  {recipe.description}
                </p>
              </div>

              {/* Ingredients List */}
              <div className="p-6 space-y-4 flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Required Ingredients ({resolvedIngredients.length})
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {resolvedIngredients.map((ing, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border border-gray-50 rounded-xl p-2 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-gray-100 rounded-lg p-1 bg-white flex items-center justify-center overflow-hidden shrink-0">
                          {ing.product?.image?.[0] ? (
                            <img
                              src={ing.product.image[0]}
                              alt={ing.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{ing.name}</p>
                          <p className="text-[11px] text-gray-400">
                            {ing.product ? (
                              ing.product.inStock ? (
                                <span className="text-emerald-500 font-medium">In Stock</span>
                              ) : (
                                <span className="text-rose-500 font-medium">Out of Stock</span>
                              )
                            ) : (
                              <span className="text-gray-400">Not Found</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {ing.product && (
                        <span className="text-xs font-bold text-primary mr-1">
                          ${ing.product.offerPrice}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  disabled={addingRecipe === recipe.id}
                  onClick={() => handleAddBundle(recipe)}
                  className={`w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed text-sm`}
                >
                  {addingRecipe === recipe.id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding to Cart...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Add Ingredients to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecipeBundles;
