import React from "react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: "green" | "blue" | "purple" | "yellow" | "red";
    subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => {
    const getColorClasses = (color: string) => {
        switch (color) {
            case "green":
                return {
                    bg: "bg-green-100",
                    text: "text-green-600",
                    iconBg: "bg-green-100",
                    iconText: "text-green-600",
                };
            case "blue":
                return {
                    bg: "bg-blue-100",
                    text: "text-blue-600",
                    iconBg: "bg-blue-100",
                    iconText: "text-blue-600",
                };
            case "purple":
                return {
                    bg: "bg-purple-100",
                    text: "text-purple-600",
                    iconBg: "bg-purple-100",
                    iconText: "text-purple-600",
                };
            case "yellow":
                return {
                    bg: "bg-yellow-100",
                    text: "text-yellow-600",
                    iconBg: "bg-yellow-100",
                    iconText: "text-yellow-600",
                };
            case "red":
                return {
                    bg: "bg-red-100",
                    text: "text-red-600",
                    iconBg: "bg-red-100",
                    iconText: "text-red-600",
                };
            default:
                return {
                    bg: "bg-gray-100",
                    text: "text-gray-600",
                    iconBg: "bg-gray-100",
                    iconText: "text-gray-600",
                };
        }
    };

    const colors = getColorClasses(color);

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
                <div className={`w-12 h-12 ${colors.iconBg} rounded-full flex items-center justify-center`}>
                    <div className={colors.iconText}>{icon}</div>
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        </div>
    );
};

export default StatsCard;
