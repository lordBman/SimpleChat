import "../css/chats/back-button.scss";
import React from "react";

const BackButton = () =>{
    const clicked = () => {
        
    }

    return (
        <span className="back-btn" onClick={clicked}>
            <span className="akar-icons--arrow-back-thick"></span>
        </span>
    );
}

export default BackButton;