'use client';

import React, { useState } from "react";
import { FaHome, FaBars, FaTrophy } from "react-icons/fa";
import c from './BottomNav.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BottomNav = () => {
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState("home");

    return (
        <div className={c.navbar} >
            <Link
                href='/profile'
                className={`${c.navItem} ${pathname === '/profile' || activeTab === "home" ? c.active : ""}`}
                onClick={() => setActiveTab("home")}
            >
                <FaHome />
            </Link>
            <Link
                href='/goals'
                className={`${c.navItem} ${pathname === '/goals' || activeTab === "menu" ? c.active : ""}`}
                onClick={() => setActiveTab("menu")}
            >
                <FaBars />
            </Link>
            <Link
                href='/achievements'
                className={`${c.navItem} ${pathname === '/achievements' || activeTab === "trophy" ? c.active : ""}`}
                onClick={() => setActiveTab("trophy")}
            >
                <FaTrophy />
            </Link>
        </div>
    );
};

export default BottomNav;
