import React, { useState } from "react";
import { FaHome, FaBars, FaTrophy } from "react-icons/fa";
import c from './BottomNav.module.css'

const BottomNav = () => {

    const [activeTab, setActiveTab] = useState("home");

    return (
        <div className={c.navbar} >
            <div
                className={`${c.navItem} ${activeTab === "home" ? c.active : ""}`}
                onClick={() => setActiveTab("home")}
            >
                <FaHome />
            </div>
            <div
                className={`${c.navItem} ${activeTab === "menu" ? c.active : ""}`}
                onClick={() => setActiveTab("menu")}
            >
                <FaBars />
            </div>
            <div
                className={`${c.navItem} ${activeTab === "trophy" ? c.active : ""}`}
                onClick={() => setActiveTab("trophy")}
            >
                <FaTrophy />
            </div>
        </div>
    );
};

export default BottomNav;
