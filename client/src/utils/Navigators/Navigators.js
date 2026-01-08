import c from './Navigators.module.css'

export const navigator = (activeTabText, setActiveTab, activeTab, text, name ) => {
    return <div
        className={`${c.navItem} ${activeTab === activeTabText ? c[name] : ""}`}
        onClick={() => setActiveTab(activeTabText)}
    >
        {text}
    </div>
}