"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Recycle, Users, Lock, Globe } from "lucide-react";

const Description = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
        },
    };

    const features = [
        {
            icon: Shield,
            title: "Blockchain Security",
            description: "Every receipt is cryptographically secured on the Celo blockchain, ensuring authenticity and preventing fraud.",
        },
        {
            icon: Zap,
            title: "Instant Verification",
            description: "Verify product authenticity instantly with our lightning-fast blockchain verification system.",
        },
        {
            icon: Recycle,
            title: "Sustainable Future",
            description: "Earn rewards for recycling electronics and contribute to a circular economy.",
        },
        {
            icon: Users,
            title: "Community Driven",
            description: "Connect with like-minded individuals and build a sustainable community together.",
        },
        {
            icon: Lock,
            title: "Privacy First",
            description: "Your data is protected with enterprise-grade encryption and privacy controls.",
        },
        {
            icon: Globe,
            title: "Global Impact",
            description: "Make a positive environmental impact while enjoying the benefits of blockchain technology.",
        },
    ];

    return (
        <section className="py-20 bg-gray-50">
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
                        Why Choose Our Platform?
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-600 max-w-3xl mx-auto"
                        variants={itemVariants}
                    >
                        We're revolutionizing the way you interact with electronic products through blockchain technology,
                        creating a more sustainable and transparent ecosystem.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                    <feature.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Description;
