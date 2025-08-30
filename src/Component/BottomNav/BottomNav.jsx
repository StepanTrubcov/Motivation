import React, { useState } from "react";
import { FaHome, FaBars, FaTrophy } from "react-icons/fa";
import c from './BottomNav.module.css'
import { Link } from "react-router-dom";

const BottomNav = () => {

    const [activeTab, setActiveTab] = useState("home");

    return (
        <div className={c.navbar} >
            <Link
                to={'/'}
                className={`${c.navItem} ${activeTab === "home" ? c.active : ""}`}
                onClick={() => setActiveTab("home")}
            >
                <FaHome />
            </Link>
            <Link
                to={'/goals'}
                className={`${c.navItem} ${activeTab === "menu" ? c.active : ""}`}
                onClick={() => setActiveTab("menu")}
            >
                <FaBars />
            </Link>
            <Link
                to={'/achievements'}
                className={`${c.navItem} ${activeTab === "trophy" ? c.active : ""}`}
                onClick={() => setActiveTab("trophy")}
            >
                <FaTrophy />
            </Link>
        </div>
    );
};

export default BottomNav;
