import { useState, useRef, useEffect } from 'react';
import c from './filter.module.css';

const filter = (
    goals = [],
    text,
    funct = () => { },
    img = 'https://assets-global.website-files.com/620cd05594501a50fa9b7e10/620cd05594501a7b789b7f06_Button.png',
    home = true,
    onDelete = () => { }
) => {
    const [longPressedId, setLongPressedId] = useState(null);
    const timerRef = useRef(null);

    const wrapperRefs = useRef({});

    const startPress = (id) => {
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
        if (home) { return <div className={c.blok}>У вас нет таких целей</div>; }
    }

    return filteredGoals.map(d => (
        <div
            key={d.id}
            className={c.wrapper}
            ref={(el) => (wrapperRefs.current[d.id] = el)}
        >
            <div
                className={c.blok}
                onClick={() => funct(d)}

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
                    <img className={c.img} src={img} alt="button" />
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
                        Убрать цель
                    </button>
                </div>
            )}
        </div>
    ));
};

export default filter;