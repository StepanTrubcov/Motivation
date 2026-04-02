import React from "react"
import { useLanguage } from '@/context/LanguageContext';
import c from './ProfileInfo.module.css'
import QuestionButton from "./QuestionButton/QuestionButton";
import LightsConteiner from "./Lights/LightsConteiner";

const ProfileInfo = (props) => {
    const { t } = useLanguage();
    if (!props.user) return null;

    return <div className={c.blok} data-tutorial-id="profile-info">
        <div className={c.ProfileInfo} >
            <div className={c.nameLights} >
                <img className={c.avatar} src={props.user.photoUrl || "https://avatars.mds.yandex.net/i?id=a95d35e45f35ee2a8c92a8a16ec415ec5ae03c2a-5220409-images-thumbs&n=13"} alt="avatar" />
                <div className={c.name}>{props.user.firstName}</div>
            </div>
            <QuestionButton />
        </div>
        <div className={c.info} >
            <div className={c.glasses} data-tutorial-id="profile-points">{props.user.pts} {t('pts')}</div>
            <div className={c.lights} >
                <LightsConteiner />    
            </div>
        </div>
    </div>
}

export default ProfileInfo;