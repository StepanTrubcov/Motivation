'use client';
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Search, Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import c from './Goals.module.css';
import { tutorialGoalsTab } from '@/lib/tutorialGoals.mjs';
import ModalWindowNewGoals from './ModalWindowNewGoals/ModalWindowNewGoals';

const Goals = ({ NewGoals, completed, inProgress, sportGoals, disciplineGoals, spiritualityGoals, selfDevelopmentGoals, catalogSearchResults, catalogSearchCount, userId, query, setQuery, myCount }) => {
    const { t } = useLanguage();
    const { currentStep, isOpen: isTutorialOpen, nextStep, setCreateGoalModalTutorialPhase } = useTutorial();
    const [isModalOpen, setOpenModal] = useState(null);
    const [activeTab, setActiveTab] = useState('mine');
    const [category, setCategory] = useState('Sport');
    const categoryTabsRef = useRef(null);
    const [categoriesInTwoRows, setCategoriesInTwoRows] = useState(false);
    useLayoutEffect(() => {
        const tabs = categoryTabsRef.current;
        if (!tabs) return;
        const updateLayout = () => {
            const buttons = Array.from(tabs.children);
            const gap = parseFloat(getComputedStyle(tabs).columnGap) || 0;
            const requiredWidth = buttons.reduce((total, button) => {
                const style = getComputedStyle(button);
                const label = button.querySelector('span');
                return total + (label?.getBoundingClientRect().width || 0)
                    + (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0)
                    + (parseFloat(style.borderLeftWidth) || 0) + (parseFloat(style.borderRightWidth) || 0);
            }, gap * Math.max(0, buttons.length - 1));
            setCategoriesInTwoRows(requiredWidth > tabs.clientWidth);
        };
        updateLayout();
        const observer = new ResizeObserver(updateLayout);
        observer.observe(tabs);
        tabs.querySelectorAll('span').forEach(label => observer.observe(label));
        return () => observer.disconnect();
    }, [activeTab, query, t]);
    useEffect(() => {
        const goalName = new URLSearchParams(window.location.search).get('achievementGoal');
        if (goalName) {
            setActiveTab('catalog');
            setQuery(goalName);
        }
    }, [setQuery]);
    useEffect(() => {
        if (!isTutorialOpen) return;
        const tab = tutorialGoalsTab(currentStep?.id);
        if (tab) setActiveTab(tab);
        if (['goals-catalog-intro', 'goals-choose-category', 'goals-take-one'].includes(currentStep?.id)) setQuery('');
        if (['goals-find-added', 'goals-take-added', 'goals-delete'].includes(currentStep?.id)) { setActiveTab('mine'); setQuery(''); }
    }, [isTutorialOpen, currentStep?.id, setQuery]);
    const categories = [
        ['Sport', 'sport', sportGoals],
        ['Discipline', 'discipline', disciplineGoals],
        ['Spirituality', 'spirituality', spiritualityGoals],
        ['Self_development', 'selfDevelopment', selfDevelopmentGoals],
    ];
    return <div>
        <header className={c.pageHeader}>
            <h1 className={c.pageTitle}>{t('goals')}</h1>
            {/* <p className={c.subtitle}>{t('goalsSubtitle')}</p> */}
        </header>
        <label className={`${c.searchField} ${query.trim() ? c.searchFieldActive : ''}`}>
            <Search size={20} aria-hidden="true" />
            <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('findGoal')} aria-label={t('findGoal')} />
        </label>
        <div className={c.mainTabs} data-tutorial-id="goals-tabs" role="tablist" aria-label={t('goals')}>
            {['mine', 'catalog'].map(tab => <button key={tab} id={`goals-${tab}-tab`} role="tab" aria-selected={activeTab === tab} aria-controls="goals-panel" className={activeTab === tab ? c.selectedTab : ''} onClick={() => { setActiveTab(tab); if (isTutorialOpen && currentStep?.id === 'goals-mine' && tab === 'catalog') nextStep(); }}>{t(tab === 'mine' ? 'myGoalsTab' : 'catalogGoalsTab')}</button>)}
        </div>
        <ModalWindowNewGoals NewGoals={NewGoals} isModalOpen={isModalOpen} closeModal={() => setOpenModal(null)} userId={userId} />
        <div id="goals-panel" role="tabpanel" aria-labelledby={`goals-${activeTab}-tab`}>
            {activeTab === 'catalog' && (
                <div className={c.sectionHeader}>
                    <button className={c.addButton} data-tutorial-id="goals-create" onClick={() => { setOpenModal(true); if (isTutorialOpen && currentStep?.id === 'goals-create') setCreateGoalModalTutorialPhase('name'); }} aria-label={t('addCustomGoal')}><Plus className={c.addButtonIcon} size={20} strokeWidth={2.2} aria-hidden="true" /><span>{t('customGoalButton')}</span></button>
                </div>
            )}
            {activeTab === 'mine' ? <>
                {myCount === 0 ? <div className={c.emptyState}>{t(query ? 'goalsSearchEmpty' : 'noSuchGoals')}</div> : <div data-tutorial-id="goals-find-added-list">{inProgress}{completed}</div>}
            </> : <>
                {query.trim() ? (
                    <>
                        {/* <div className={c.searchResultsLabel}>{t('goalSearchResults')}: {catalogSearchCount}</div> */}
                        {catalogSearchCount ? catalogSearchResults : <div className={c.emptyState}>{t('goalsSearchEmpty')}</div>}
                    </>
                ) : (
                    <>
                        <div ref={categoryTabsRef} className={`${c.categoryTabs} ${categoriesInTwoRows ? c.categoryTabsTwoRows : ''}`} data-tutorial-id="goals-category-tabs" aria-label={t('catalogGoalsTab')}>
                            {categories.map(([id, label]) => <button key={id} aria-pressed={category === id} onClick={() => { setCategory(id); if (isTutorialOpen && currentStep?.id === 'goals-choose-category' && currentStep.requireCategoryClick) nextStep(); }} className={category === id ? c.selectedCategory : ''}><span>{t(label)}</span></button>)}
                        </div>
                        <div data-tutorial-id="goals-catalog-list">{categories.find(([id]) => id === category)?.[2]}</div>
                    </>
                )}
            </>}
        </div>
    </div>;
};
export default Goals;
