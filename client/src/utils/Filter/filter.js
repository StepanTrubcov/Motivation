import GoalStatusIcon from '@/components/GoalStatusIcon/GoalStatusIcon';
import GoalIcon from '@/components/GoalIcon/GoalIcon';
import { pointsLabelKey } from '@/lib/formatPoints';
import { formatGoalDuration } from '@/lib/goalTimeOptions';
import { useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Trash2 } from 'lucide-react';
import { useTutorial } from '@/context/TutorialContext';
import c from './filter.module.css';

const DEFAULT_BUTTON_IMG = 'https://assets-global.website-files.com/620cd05594501a50fa9b7e10/620cd05594501a7b789b7f06_Button.png';
const COMPLETED_CHECK_IMG = 'https://i.postimg.cc/g00CMHm0/png-clipart-information-management-service-compute-no-bg-preview-carve-photos.png';

const Filter = (
    goals = [],
    text,
    funct = () => { },
    img = DEFAULT_BUTTON_IMG,
    home = true,
    onDelete = () => { },
    disabled = false,
    carousel = false
) => {
    const { t, language } = useLanguage();
    const { lastCreatedGoalId } = useTutorial();
    const [swipeState, setSwipeState] = useState({ id: null, offset: 0 });
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const gestureRef = useRef(null);
    const lastSwipeAtRef = useRef(0);
    const canSwipeDelete = !disabled && !carousel && (text === 'in_progress' || text === 'completed');

    const startSwipe = (event, id) => {
        if (!canSwipeDelete || event.button > 0 || deleteConfirmId === id) return;
        gestureRef.current = {
            id,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startOffset: swipeState.id === id ? swipeState.offset : 0,
            horizontal: false,
            offset: swipeState.id === id ? swipeState.offset : 0,
        };
    };

    const moveSwipe = (event) => {
        const gesture = gestureRef.current;
        if (!gesture) return;
        const deltaX = event.clientX - gesture.startX;
        const deltaY = event.clientY - gesture.startY;

        if (!gesture.horizontal) {
            if (Math.abs(deltaY) > 12 && Math.abs(deltaY) > Math.abs(deltaX)) {
                gestureRef.current = null;
                return;
            }
            if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
                gesture.horizontal = true;
                event.currentTarget.setPointerCapture?.(gesture.pointerId);
            }
        }
        if (!gesture.horizontal) return;

        event.preventDefault();
        gesture.offset = Math.max(0, Math.min(156, gesture.startOffset + deltaX));
        setSwipeState({ id: gesture.id, offset: gesture.offset });
    };

    const endSwipe = () => {
        const gesture = gestureRef.current;
        if (!gesture) return;
        gestureRef.current = null;
        if (!gesture.horizontal) return;

        lastSwipeAtRef.current = Date.now();
        if (gesture.offset >= 132) {
            setSwipeState({ id: null, offset: 0 });
            setDeleteConfirmId(gesture.id);
        } else if (gesture.offset >= 42) {
            setSwipeState({ id: gesture.id, offset: 68 });
        } else {
            setSwipeState({ id: null, offset: 0 });
        }
    };

    const cancelSwipe = () => {
        gestureRef.current = null;
        setSwipeState((current) => current.offset >= 42 ? { ...current, offset: 68 } : { id: null, offset: 0 });
    };

    const filteredGoals = goals.filter(g => g.status === text);

    if (filteredGoals.length === 0) {
        if (home) { return <div className={c.blok}>{t('noSuchGoals')}</div>; }
    }

    return filteredGoals.map(d => (
        <div
            key={d.id}
            data-goal-id={d.id}
            data-tutorial-id={d.id === lastCreatedGoalId ? 'tutorial-custom-goal' : undefined}
            className={`${c.wrapper} ${canSwipeDelete ? c.swipeWrapper : ''} ${carousel ? c.wrapperCarousel : ''}`}
        >
            {canSwipeDelete && (
                <div className={c.deleteReveal} aria-hidden={swipeState.id !== d.id || swipeState.offset === 0}>
                    <button
                        type="button"
                        className={c.deleteRevealButton}
                        onClick={(event) => {
                            event.stopPropagation();
                            setSwipeState({ id: null, offset: 0 });
                            setDeleteConfirmId(d.id);
                        }}
                        aria-label={t('removeGoal')}
                        tabIndex={swipeState.id === d.id && swipeState.offset > 0 ? 0 : -1}
                    >
                        <Trash2 size={22} aria-hidden="true" />
                    </button>
                </div>
            )}
            <div
                className={`${c.swipeSurface} ${gestureRef.current?.id === d.id && gestureRef.current?.horizontal ? c.swipeDragging : ''}`}
                style={canSwipeDelete ? { transform: `translateX(${swipeState.id === d.id ? swipeState.offset : 0}px)` } : undefined}
            >
            <div
                className={`${c.blok} ${c.goalCard} ${disabled ? c.blokDisabled : ''} ${carousel ? c.blokCarousel : ''}`}
                data-completed={d.status === 'completed' ? 'true' : undefined}
                onClick={(e) => {
                    if (disabled) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    if (canSwipeDelete && (Date.now() - lastSwipeAtRef.current < 500 || (swipeState.id === d.id && swipeState.offset > 0))) {
                        lastSwipeAtRef.current = 0;
                        setSwipeState({ id: null, offset: 0 });
                        return;
                    }
                    funct(d);
                }}
                onPointerDown={(event) => startSwipe(event, d.id)}
                onPointerMove={moveSwipe}
                onPointerUp={endSwipe}
                onPointerCancel={cancelSwipe}
            >
                <GoalIcon goal={d} />
                <div className={c.goalText}>
                    <div className={c.title} title={d.title}>
                        {d.durationMinutes != null || d.targetTime
                            ? (d.targetTime ? d.timeBaseTitle : d.durationBaseTitle) || d.baseTitle || d.title
                            : d.title}
                    </div>
                    {(d.durationMinutes != null || d.targetTime) ? (
                        <div className={c.goalTime}>{d.targetTime || formatGoalDuration(d.durationMinutes, language)}</div>
                    ) : null}
                    <div className={c.pts}>{d.points} {t(language === 'ru' ? pointsLabelKey(d.points, language) : 'pts')}</div>
                </div>
                <div>
                    {img === DEFAULT_BUTTON_IMG ? (
                        <div className={c.circleButton} aria-hidden="true" />
                    ) : img === COMPLETED_CHECK_IMG ? (
                        <GoalStatusIcon completed />
                    ) : (
                        <GoalStatusIcon />
                    )}
                </div>
            </div>
            </div>

            {deleteConfirmId === d.id && (
                <div className={c.deleteConfirm} role="alertdialog" aria-modal="true" aria-labelledby={`delete-goal-${d.id}`}>
                    <p id={`delete-goal-${d.id}`}>{t('confirmGoalRemoval')}</p>
                    <div className={c.deleteConfirmActions}>
                    <button
                        className={c.cancelDeleteButton}
                        onClick={() => setDeleteConfirmId(null)}
                    >
                        {t('cancelGoalRemoval')}
                    </button>
                    <button
                        className={c.deleteBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(d);
                            setDeleteConfirmId(null);
                            setSwipeState({ id: null, offset: 0 });
                        }}
                    >
                        {t('confirmDeleteAction')}
                    </button>
                    </div>
                </div>
            )}
        </div>
    ));
};

export default Filter;
