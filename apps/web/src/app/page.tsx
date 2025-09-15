"use client";

import React from "react";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import Support from "@/components/home/Support";
import HeroSection from "@/components/home/HeroSection";
import Description from "@/components/home/Description";
import HowItWorks from "@/components/home/HowItWorks";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main role="main" aria-labelledby="home-title">
        <HeroSection />
        <Description />
        <HowItWorks />
      </main>
      <Support />
      <Footer />
      
    </div>
  );
};

export default Home;
