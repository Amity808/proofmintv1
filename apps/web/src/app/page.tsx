"use client";

import React from "react";
import Link from "next/link";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import Support from "@/components/home/Support";
import HeroSection from "@/components/home/HeroSection";
import Description from "@/components/home/Description";
import HowItWorks from "@/components/home/HowItWorks";
import { HumanVerification } from "@/components/Verification/HumanVerification";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main role="main" aria-labelledby="home-title">
        <HeroSection />

        {/* Verification Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Get Started with ProofMint
                </h2>
                <p className="text-lg text-gray-600">
                  Complete human verification to unlock all features
                </p>
              </div>

              <HumanVerification />

              <div className="text-center mt-8">
                <Link
                  href="/verify"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Go to Verification Page
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Description />
        <HowItWorks />
      </main>
      <Support />
      <Footer />

    </div>
  );
};

export default Home;
