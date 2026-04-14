import React, { useEffect, useMemo, useState } from "react"
import { useLanguage } from '@/context/LanguageContext';
import c from './ProfileInfo.module.css'
import QuestionButton from "./QuestionButton/QuestionButton";
import LightsConteiner from "./Lights/LightsConteiner";

const formatPts = (value, language) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return value ?? '';

    const abs = Math.abs(n);
    const isRu = language === 'ru';
    const thousandSuffix = isRu ? 'к' : 'k';
    const millionSuffix = isRu ? 'м' : 'M';

    const formatOneDecimal = (x) => {
        const rounded = Math.round(x * 10) / 10;
        return Number.isInteger(rounded) ? String(rounded) : String(rounded);
    };

    if (abs >= 1_000_000) return `${formatOneDecimal(n / 1_000_000)}${millionSuffix}`;
    if (abs >= 1_000) return `${formatOneDecimal(n / 1_000)}${thousandSuffix}`;
    return String(n);
};

const ProfileInfo = (props) => {
    const { t, language } = useLanguage();
    if (!props.user) return null;

    const placeholderSrc = useMemo(
        () => "https://avatars.mds.yandex.net/i?id=a95d35e45f35ee2a8c92a8a16ec415ec5ae03c2a-5220409-images-thumbs&n=13",
        []
    );

    const photoUrl = props.user.photoUrl || null;
    const [avatarSrc, setAvatarSrc] = useState(placeholderSrc);

    useEffect(() => {
        let cancelled = false;

        // Всегда показываем заглушку, пока реальный аватар не загрузится.
        setAvatarSrc(placeholderSrc);

        if (!photoUrl) return () => { cancelled = true; };

        const img = new Image();
        img.decoding = "async";
        img.src = photoUrl;

        img.onload = () => {
            if (cancelled) return;
            setAvatarSrc(photoUrl);
        };

        img.onerror = () => {
            if (cancelled) return;
            setAvatarSrc(placeholderSrc);
        };

        return () => {
            cancelled = true;
        };
    }, [photoUrl, placeholderSrc]);

    const ptsText = formatPts(props.user.pts, language);

    return <div className={c.blok} data-tutorial-id="profile-info">
        <div className={c.ProfileInfo} >
            <div className={c.nameLights} >
                <img
                    className={c.avatar}
                    src={avatarSrc}
                    alt="avatar"
                    loading="lazy"
                    decoding="async"
                    onError={() => setAvatarSrc(placeholderSrc)}
                />
                <div className={c.name}>{props.user.firstName}</div>
            </div>
            <QuestionButton />
        </div>
        <div className={c.info} >
            <div className={c.glasses} data-tutorial-id="profile-points">{ptsText} {t('pts')}</div>
            <div className={c.lights} >
                <LightsConteiner />    
            </div>
        </div>
    </div>
}

export default ProfileInfo;