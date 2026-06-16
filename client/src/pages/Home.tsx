import React from "react";
import MainBanner from "../components/MainBanner";
import Categories from "../components/Categories";
import BestSelller from "../components/BestSelller";
import RecipeBundles from "../components/RecipeBundles";
import BottomBanner from "../components/BottomBanner";
import NewsLetter from "../components/NewsLetter";

const Home = () => {
  return (
    <div className="mt-10">
      <MainBanner />
      <Categories />
      <BestSelller />
      <RecipeBundles />
      <BottomBanner />
      <NewsLetter />
    </div>
  );
};

export default Home;
