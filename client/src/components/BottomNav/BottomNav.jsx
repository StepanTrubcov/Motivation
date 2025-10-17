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
                className={`${c.navItem} ${pathname === '/goals' || activeTab === "goals" ? c.active : ""}`}
                onClick={() => setActiveTab("goals")}
            >
                <FaBars />
            </Link>
            <Link
                href='/achievements'
                className={`${c.navItem} ${pathname === '/achievements' || activeTab === "achievements" ? c.active : ""}`}
                onClick={() => setActiveTab("achievements")}
            >
                <FaTrophy />
            </Link>
        </div>
    );
};

export default BottomNav;
