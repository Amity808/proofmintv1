"use client";

import React from "react";
import { RainbowKitTest } from "@/components/RainbowKitTest";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

const TestConnectPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 p-4">
                <div className="container mx-auto">
                    <RainbowKitTest />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TestConnectPage;
