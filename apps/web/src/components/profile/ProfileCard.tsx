"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Award,
    Calendar,
    Edit3,
    ExternalLink,
    Heart,
    MapPin,
    Recycle,
    Settings,
    Shield,
    ShoppingBag,
    Star,
    User,
    Users,
} from "lucide-react";

interface ProfileData {
    address: string;
    avatar?: string;
    bio?: string;
    location?: string;
    joinDate: string;
    verified: boolean;
    stats: {
        receipts: number;
        recycled: number;
        followers: number;
        following: number;
        rating: number;
        totalSpent: number;
        carbonSaved: number;
    };
    badges: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        color: string;
    }>;
    recentActivity: Array<{
        id: string;
        type: "receipt" | "recycling" | "follow" | "achievement";
        title: string;
        description: string;
        timestamp: string;
    }>;
}

interface ProfileCardProps {
    profileData: ProfileData;
    isOwnProfile?: boolean;
    onEdit?: () => void;
    onFollow?: () => void;
    onUnfollow?: () => void;
    isFollowing?: boolean;
    variant?: "full" | "compact" | "minimal";
}

const ProfileCard: React.FC<ProfileCardProps> = ({
    profileData,
    isOwnProfile = false,
    onEdit,
    onFollow,
    onUnfollow,
    isFollowing = false,
    variant = "full",
}) => {
    const [showFullBio, setShowFullBio] = useState(false);

    const displayName = `${profileData.address.slice(0, 6)}...${profileData.address.slice(-4)}`;

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "receipt":
                return <ShoppingBag className="w-4 h-4 text-green-600" />;
            case "recycling":
                return <Recycle className="w-4 h-4 text-blue-600" />;
            case "follow":
                return <Users className="w-4 h-4 text-purple-600" />;
            case "achievement":
                return <Award className="w-4 h-4 text-yellow-600" />;
            default:
                return <User className="w-4 h-4 text-gray-500" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case "receipt":
                return "bg-green-50 border-green-200";
            case "recycling":
                return "bg-blue-50 border-blue-200";
            case "follow":
                return "bg-purple-50 border-purple-200";
            case "achievement":
                return "bg-yellow-50 border-yellow-200";
            default:
                return "bg-gray-50 border-gray-200";
        }
    };

    if (variant === "minimal") {
        return (
            <div className="flex items-center gap-3 p-3 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                        {"U"}
                    </span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{displayName}</h3>
                        {profileData.verified && <Shield className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-sm text-gray-600">{profileData.stats.followers} followers</p>
                </div>
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                            {"U"}
                        </span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">{displayName}</h3>
                            {profileData.verified && <Shield className="w-5 h-5 text-blue-600" />}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{profileData.bio || "Sustainable electronics enthusiast"}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{profileData.stats.followers} followers</span>
                            <span>{profileData.stats.following} following</span>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                {profileData.stats.rating}
                            </div>
                        </div>
                    </div>
                    {!isOwnProfile && (
                        <button
                            onClick={isFollowing ? onUnfollow : onFollow}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isFollowing
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-2xl">
                                {"U"}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                                {profileData.verified && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        <Shield className="w-3 h-3" />
                                        Verified
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-600 mb-2">
                                {profileData.bio || "Sustainable electronics enthusiast building a greener future"}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                {profileData.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {profileData.location}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined {profileData.joinDate}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isOwnProfile ? (
                            <>
                                <button
                                    onClick={onEdit}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit Profile"
                                >
                                    <Edit3 className="w-5 h-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => console.log("Settings")}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Settings"
                                >
                                    <Settings className="w-5 h-5 text-gray-600" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={isFollowing ? onUnfollow : onFollow}
                                className={`px-6 py-2 rounded-full font-medium transition-colors ${isFollowing
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{profileData.stats.receipts}</div>
                        <div className="text-sm text-gray-600">NFT Receipts</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{profileData.stats.recycled}</div>
                        <div className="text-sm text-gray-600">Items Recycled</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{profileData.stats.followers}</div>
                        <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">{profileData.stats.following}</div>
                        <div className="text-sm text-gray-600">Following</div>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">{profileData.stats.rating}</div>
                        <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">${profileData.stats.totalSpent.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{profileData.stats.carbonSaved}kg</div>
                        <div className="text-sm text-gray-600">Carbon Saved</div>
                    </div>
                </div>
            </div>

            {/* Badges */}
            {profileData.badges.length > 0 && (
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
                    <div className="flex flex-wrap gap-2">
                        {profileData.badges.map(badge => (
                            <div key={badge.id} className={`px-3 py-2 rounded-full text-sm font-medium ${badge.color}`}>
                                {badge.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {profileData.recentActivity.slice(0, 5).map(activity => (
                        <div key={activity.id} className={`p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                                    <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                                    <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
