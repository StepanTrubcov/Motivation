import c from './Navigators.module.css'

export const navigator = (activeTabText, setActiveTab, activeTab, text, name, tutorialId) => {
    return <div
        className={`${c.navItem} ${activeTab === activeTabText ? c[name] : ""}`}
        onClick={() => setActiveTab(activeTabText)}
        {...(tutorialId ? { 'data-tutorial-id': tutorialId } : {})}
    >
        {text}
    </div>
}