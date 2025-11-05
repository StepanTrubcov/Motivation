import React from "react"
import c from './ProfileInfo.module.css'
import QuestionButton from "./QuestionButton/QuestionButton";

const ProfileInfo = (props) => {
    if (!props.user) return null;

    return <div className={c.blok} >
        <div className={c.ProfileInfo} >
            <img className={c.avatar} src={props.user.photoUrl || "https://avatars.mds.yandex.net/i?id=a95d35e45f35ee2a8c92a8a16ec415ec5ae03c2a-5220409-images-thumbs&n=13"} alt="avatar" />
            <div className={c.info} >
                <div className={c.name}>{props.user.firstName}</div>
                <div className={c.glasses}>{props.user.pts} pts</div>
            </div>
        </div>
        <QuestionButton />
    </div>
}

export default ProfileInfo;