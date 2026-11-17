import React, { useEffect, useMemo, useState } from "react"
import { useLanguage } from '@/context/LanguageContext';
import c from './ProfileInfo.module.css'
import QuestionButton from "./QuestionButton/QuestionButton";
import LightsConteiner from "./Lights/LightsConteiner";
import { Gem } from 'lucide-react';
import { formatPoints, pointsLabelKey } from '@/lib/formatPoints';

const ProfileInfo = (props) => {
    const { t, language } = useLanguage();

    const placeholderSrc = useMemo(
        () => "https://avatars.mds.yandex.net/i?id=a95d35e45f35ee2a8c92a8a16ec415ec5ae03c2a-5220409-images-thumbs&n=13",
        []
    );

    const photoUrl = props.user?.photoUrl || null;
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

    if (!props.user) return null;

    const ptsText = formatPoints(props.user.pts, language);
    const ptsLabel = t(pointsLabelKey(props.user.pts, language));

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
            <div className={c.glasses} data-tutorial-id="profile-points">
                <Gem className={c.pointsIcon} aria-hidden="true" />
                <div className={c.pointsText}>
                    <span className={c.pointsValue}>{ptsText}</span>
                    <span className={c.pointsUnit}>{ptsLabel}</span>
                </div>
            </div>
            <div className={c.lights} >
                <LightsConteiner />    
            </div>
        </div>
    </div>
}

export default ProfileInfo;