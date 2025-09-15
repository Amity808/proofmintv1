"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Recycle, Shield, Zap } from "lucide-react";
import { useAccount } from "wagmi";

const HeroSection = () => {
    const textVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    const buttonVariants = {
        hover: { scale: 1.05, boxShadow: "0px 8px 25px rgba(59, 130, 246, 0.25)" },
        tap: { scale: 0.95 },
    };

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
    };

    const featureVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    const { isConnected } = useAccount();

    return (
        <section className="relative pt-20 lg:pt-32 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50 min-h-screen flex items-center overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
                <div className="w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
            </div>
            <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
                <div className="w-96 h-96 bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Content */}
                    <div className="text-center lg:text-left">
                        <motion.div
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-6"
                            variants={textVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Zap className="w-4 h-4" />
                            Powered by Celo Blockchain
                        </motion.div>

                        <motion.h1
                            className="font-bold text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-6 leading-tight"
                            variants={textVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.1 }}
                        >
                            The Future of <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Digital Receipts</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                            variants={textVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                        >
                            Buy electronics with blockchain-verified NFT receipts. Track authenticity, enable recycling, and earn
                            rewards through our sustainable ecosystem on Celo.
                        </motion.p>

                        {/* Features */}
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
                            variants={featureVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-100">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 text-sm">Verified</p>
                                    <p className="text-xs text-gray-600">Authentic products</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-100">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Recycle className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 text-sm">Sustainable</p>
                                    <p className="text-xs text-gray-600">Earn from recycling</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-100">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Zap className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 text-sm">Fast</p>
                                    <p className="text-xs text-gray-600">Lightning speed</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            variants={textVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.4 }}
                        >
                            <Link href={isConnected ? "/dashboard" : "/marketplace"}>
                                <motion.button
                                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    {isConnected ? "Go to Dashboard" : "Start Shopping"}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>

                            <Link href="/how-it-works">
                                <motion.button
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Learn More
                                </motion.button>
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        {isConnected && (
                            <motion.div
                                className="mt-8 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <p className="text-sm text-gray-600 mb-2">Connected to Celo Network</p>
                                <p className="text-xs text-gray-500 font-mono">Contract: 0x045962...5c55c</p>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Image */}
                    <motion.div
                        className="flex justify-center lg:justify-end"
                        variants={imageVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.5 }}
                    >
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl"></div>
                            <div className="relative w-full max-w-lg h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-2xl shadow-black/10 border border-white/20 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Zap className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Blockchain Receipts</h3>
                                    <p className="text-gray-600">Secure, verifiable, and sustainable</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;