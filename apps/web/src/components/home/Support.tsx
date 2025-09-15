"use client";

import { motion } from "framer-motion";
import { MessageCircle, Mail, Phone, HelpCircle } from "lucide-react";

const Support = () => {
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

    const supportOptions = [
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Get instant help from our support team",
            action: "Start Chat",
        },
        {
            icon: Mail,
            title: "Email Support",
            description: "Send us an email and we'll respond within 24 hours",
            action: "Send Email",
        },
        {
            icon: Phone,
            title: "Phone Support",
            description: "Call us for urgent assistance",
            action: "Call Now",
        },
        {
            icon: HelpCircle,
            title: "Help Center",
            description: "Browse our comprehensive knowledge base",
            action: "Browse FAQ",
        },
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-12"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        variants={itemVariants}
                    >
                        Need Help?
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                        variants={itemVariants}
                    >
                        Our support team is here to help you every step of the way.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {supportOptions.map((option, index) => (
                        <motion.div
                            key={index}
                            className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <option.icon className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                            <p className="text-gray-600 mb-4 text-sm">{option.description}</p>
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                {option.action}
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Support;
