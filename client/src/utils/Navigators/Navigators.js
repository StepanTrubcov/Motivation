import c from './Navigators.module.css'

export const navigator = (activeTabText, setActiveTab, activeTab, text, name, tutorialId, disabled) => {
    const isActive = activeTab === activeTabText;
    return <div
        className={`${c.navItem} ${isActive ? c[name] : ''} ${disabled ? c.navItemDisabled : ''}`}
        onClick={disabled ? undefined : () => setActiveTab(activeTabText)}
        role={disabled ? 'presentation' : 'button'}
        aria-disabled={disabled || undefined}
        {...(tutorialId ? { 'data-tutorial-id': tutorialId } : {})}
    >
        {text}
    </div>
}