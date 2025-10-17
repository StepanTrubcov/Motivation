import React from "react"
import c from './ProfileInfo.module.css'

const ProfileInfo = (props) => {
    if (!props.user) return null;
    
    return <div className={c.ProfileInfo} >
        <img className={c.avatar} src={props.user.photoUrl || "https://yt3.googleusercontent.com/NsVAhcGfJeZWQApD3rSz1zCgkKaiqqP5bxngE6CA5S9X0ore-3zZYX2m_hybUO7y7l9IduzKQA=s900-c-k-c0x00ffffff-no-rj"} alt="avatar" />
        <div className={c.info} >
            <div className={c.name}>{props.user.firstName}</div>
            <div className={c.glasses}>{props.user.pts} pts</div>
        </div>
    </div>
}

export default ProfileInfo;