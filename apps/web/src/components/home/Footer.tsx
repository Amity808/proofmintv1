import Link from "next/link";
import { CiMail } from "react-icons/ci";
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-white p-6 lg:p-12">
            <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-start gap-4">
                    <Link href="/" className="flex items-center space-x-2" aria-label="My Celo App Home">
                        <h1 className="text-xl font-bold">My Celo App</h1>
                    </Link>
                    <div className="flex items-center text-gray-600">
                        <div className="mr-2">
                            <CiMail size={24} />
                        </div>
                        <a href="mailto:contact@myceloapp.com" className="text-base" aria-label="Email support">
                            contact@myceloapp.com
                        </a>
                    </div>
                </div>
                <div className="flex flex-col items-start gap-4">
                    <p className="text-gray-600 font-semibold text-base">Quick Links</p>
                    <div className="flex flex-col gap-2">
                        <Link href="/marketplace" className="text-gray-600 hover:text-blue-600">
                            Marketplace
                        </Link>
                        <Link href="/nft-receipts" className="text-gray-600 hover:text-blue-600">
                            NFT Receipts
                        </Link>
                        <Link href="/recycling" className="text-gray-600 hover:text-blue-600">
                            Recycling
                        </Link>
                        <Link href="/track" className="text-gray-600 hover:text-blue-600">
                            Track Items
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-4">
                    <p className="text-gray-600 font-semibold text-base">Connect with Us</p>
                    <div className="flex gap-4">
                        <a
                            href="https://www.linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="My Celo App on LinkedIn"
                            className="text-gray-600 hover:text-blue-600"
                        >
                            <FaLinkedin size={24} />
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="My Celo App on Twitter"
                            className="text-gray-600 hover:text-blue-600"
                        >
                            <FaTwitter size={24} />
                        </a>
                        <a
                            href="https://www.facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="My Celo App on Facebook"
                            className="text-gray-600 hover:text-blue-600"
                        >
                            <FaFacebook size={24} />
                        </a>
                    </div>
                </div>
            </div>
            <div className="mt-10 text-center">
                <div className="flex justify-center gap-8 mb-4">
                    <Link href="/terms" className="text-gray-600 text-base hover:text-blue-600">
                        Terms of Use
                    </Link>
                    <Link href="/privacy" className="text-gray-600 text-base hover:text-blue-600">
                        Privacy Policy
                    </Link>
                </div>
                <p className="text-gray-600 text-sm">© {new Date().getFullYear()} My Celo App</p>
            </div>
        </footer>
    );
};

export default Footer;
