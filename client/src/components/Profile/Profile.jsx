import React from "react";
import MonthlyPointsScale from "./MonthlyPointsScale/MonthlyPointsScale";
import ProfileInfoConteiner from "./ProfileInfo/ProfileInfoConteiner";
import TodaysGoalsConteiner from "./TodaysGoals/TodaysGoalsConteiner";
import ContributionCalendarConteiner from "./ContributionCalendar/ContributionCalendarConteiner";
import GenerationButtonConteiner from "./GenerationButton/GenerationButtonConteiner";

const Profile = (props) => {
    return <div>
        <MonthlyPointsScale userPoints={props.pts} />
        <ProfileInfoConteiner />
        <TodaysGoalsConteiner />
        <GenerationButtonConteiner />
        <ContributionCalendarConteiner />
    </div>
}

export default Profile;