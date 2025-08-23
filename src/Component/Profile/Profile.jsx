import React from "react";
import MonthlyPointsScale from "./MonthlyPointsScale/MonthlyPointsScale";
import ProfileInfoConteiner from "./ProfileInfo/ProfileInfoConteiner";
import TodaysGoalsConteiner from "./TodaysGoals/TodaysGoalsConteiner";
import ContributionCalendarConteiner from "./ContributionCalendar/ContributionCalendarConteiner";

const Profile = () => {
    return <div>
        <MonthlyPointsScale userPoints={580} />
        <ProfileInfoConteiner />
        <TodaysGoalsConteiner />
        <ContributionCalendarConteiner/>
    </div>
}

export default Profile;