import React from "react";
import c from './QuestionButton.module.css'

const QuestionButton = () => {
    const handleImageClick = () => {
        window.open('https://t.me/keep_alive_Assistant_bot', '_blank');
    };

    return <img 
        className={c.img} 
        src='https://i.postimg.cc/rpTDmccn/free-icon-ask-5127862.png' 
        onClick={handleImageClick}
        alt="Ask a question"
        style={{ cursor: 'pointer' }}
    />
}

export default QuestionButton;