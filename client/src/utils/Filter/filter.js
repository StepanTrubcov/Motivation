import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
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
    const { t } = useLanguage();
    const [longPressedId, setLongPressedId] = useState(null);
    const timerRef = useRef(null);

    const wrapperRefs = useRef({});

    const startPress = (id) => {
        if (disabled) return;
        timerRef.current = setTimeout(() => {
            if (text === "in_progress" || text === "completed") {
                setLongPressedId(id);
            }
        }, 1000);
    };

    const endPress = () => clearTimeout(timerRef.current);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!longPressedId) return;

            const wrapper = wrapperRefs.current[longPressedId];
            if (wrapper && !wrapper.contains(event.target)) {
                setLongPressedId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [longPressedId]);

    const filteredGoals = goals.filter(g => g.status === text);

    if (filteredGoals.length === 0) {
        if (home) { return <div className={c.blok}>{t('noSuchGoals')}</div>; }
    }

    return filteredGoals.map(d => (
        <div
            key={d.id}
            className={`${c.wrapper} ${carousel ? c.wrapperCarousel : ''}`}
            ref={(el) => (wrapperRefs.current[d.id] = el)}
        >
            <div
                className={`${c.blok} ${disabled ? c.blokDisabled : ''} ${carousel ? c.blokCarousel : ''}`}
                onClick={(e) => {
                    if (disabled) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    funct(d);
                }}
                onMouseDown={() => startPress(d.id)}
                onMouseUp={endPress}
                onMouseLeave={endPress}

                onTouchStart={() => startPress(d.id)}
                onTouchEnd={endPress}
            >
                <div>
                    <div className={c.title}>{d.title}</div>
                    <div className={c.pts}>{d.points} pts</div>
                </div>
                <div>
                    {img === DEFAULT_BUTTON_IMG ? (
                        <div className={c.circleButton} aria-hidden="true" />
                    ) : img === COMPLETED_CHECK_IMG ? (
                        <div className={c.circleCheck} aria-hidden="true" />
                    ) : (
                        <img className={c.img} src={img} alt="button" />
                    )}
                </div>
            </div>

            {longPressedId === d.id && (
                <div className={c.popup}>
                    <button
                        className={c.deleteBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(d);
                            setLongPressedId(null);
                        }}
                    >
                        {t('removeGoal')}
                    </button>
                </div>
            )}
        </div>
    ));
};

export default Filter;