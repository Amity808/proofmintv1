"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Shield, Recycle, Gift } from "lucide-react";

const HowItWorks = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
        },
    };

    const steps = [
        {
            number: "01",
            icon: ShoppingCart,
            title: "Shop & Purchase",
            description: "Browse our marketplace and purchase electronics from verified merchants. Your transaction is recorded on the blockchain.",
        },
        {
            number: "02",
            icon: Shield,
            title: "Receive NFT Receipt",
            description: "Get an instant NFT receipt that proves ownership and authenticity. This receipt is permanently stored on the Celo blockchain.",
        },
        {
            number: "03",
            icon: Recycle,
            title: "Track & Recycle",
            description: "Track your product's lifecycle and earn rewards when you recycle. Contribute to a sustainable future while earning tokens.",
        },
        {
            number: "04",
            icon: Gift,
            title: "Earn Rewards",
            description: "Earn tokens for sustainable practices, referrals, and community participation. Use rewards for future purchases.",
        },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        variants={itemVariants}
                    >
                        How It Works
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-600 max-w-3xl mx-auto"
                        variants={itemVariants}
                    >
                        Our simple 4-step process makes it easy to start your sustainable blockchain journey.
                    </motion.p>
                </motion.div>

                <div className="relative">
                    {/* Connection Line */}
                    <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"></div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="relative text-center"
                                variants={itemVariants}
                            >
                                {/* Step Number */}
                                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <span className="text-white font-bold text-lg">{step.number}</span>
                                </div>

                                {/* Step Content */}
                                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex justify-center mb-4">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <step.icon className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
