import c from './Navigators.module.css'

export const navigator = (activeTabText, setActiveTab, activeTab, text) => {
    return <div
        className={`${c.navItem} ${activeTab === activeTabText ? c.active : ""}`}
        onClick={() => setActiveTab(activeTabText)}
    >
        {text}
    </div>
}