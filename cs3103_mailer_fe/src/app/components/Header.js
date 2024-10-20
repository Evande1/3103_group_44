"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, List } from "lucide-react";

const Header = () => {
    const router = useRouter();

    return (
        <header className="bg-blue-600 text-white shadow-md">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-xl font-bold">
                        SmartDispatch Mailer
                    </Link>
                    <nav>
                        <ul className="flex space-x-4">
                            <li>
                                <Link
                                    href="/jobs"
                                    className={`flex items-center hover:text-blue-200 transition-colors ${
                                        router.pathname === "/jobs"
                                            ? "text-blue-200"
                                            : ""
                                    }`}
                                >
                                    <List className="w-5 h-5 mr-1" />
                                    Jobs
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className={`flex items-center hover:text-blue-200 transition-colors ${
                                        router.pathname === "/"
                                            ? "text-blue-200"
                                            : ""
                                    }`}
                                >
                                    <Mail className="w-5 h-5 mr-1" />
                                    Send Email
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
