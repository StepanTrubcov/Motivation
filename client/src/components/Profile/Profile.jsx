import React, { useState } from "react";
import MonthlyPointsScale from "./MonthlyPointsScale/MonthlyPointsScale";
import ProfileInfoConteiner from "./ProfileInfo/ProfileInfoConteiner";
import TodaysGoalsConteiner from "./TodaysGoals/TodaysGoalsConteiner";
import ContributionCalendarConteiner from "./ContributionCalendar/ContributionCalendarConteiner";
import GenerationButtonConteiner from "./GenerationButton/GenerationButtonConteiner";
import YesterdayConteiner from "./Yesterday/YesterdayConteiner";

const Profile = (props) => {

    const [display, setDisplay] = useState(true)

    return <div>
        {display && <div>
            <MonthlyPointsScale userPoints={props.pts} />
            <ProfileInfoConteiner />
            <TodaysGoalsConteiner />
            <GenerationButtonConteiner />
            <ContributionCalendarConteiner />
        </div>
        }
        <YesterdayConteiner setDisplay={setDisplay} />
    </div>
}

export default Profile;
