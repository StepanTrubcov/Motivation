import React from "react";
import MonthlyPointsScale from "./MonthlyPointsScale/MonthlyPointsScale";
import ProfileInfoConteiner from "./ProfileInfo/ProfileInfoConteiner";

const Profile = () => {
    return <div>
        <MonthlyPointsScale userPoints={580} />
        <ProfileInfoConteiner />
    </div>
}

export default Profile;