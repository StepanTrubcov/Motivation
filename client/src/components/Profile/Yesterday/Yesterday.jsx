import React from "react";
import c from './Yesterday.module.css'

const Yesterday = ({ setDate, goalsForSelectedDate }) => {

    const arrowRight = '>'
    const arrowLeft = '<'

    const rollback = () => {

        const date = new Date();
        date.setDate(date.getDate() - 1);
        setDate(date.toISOString().split('T')[0]);


    }


    return <div className={c.Yesterday} >
        <button onClick={rollback} className={c.button} >{arrowLeft}</button>
        <div className={c.name} >
            Отмотать день
        </div>
        <button className={c.button} >{arrowRight}</button>
    </div>
};

export default Yesterday;