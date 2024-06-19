import React from "react";
import "../css/chats/back-button.scss";
import { MainContext, MainContextType } from "../providers/main-provider";

const BackButton = () =>{
    const { clear } = React.useContext(MainContext) as MainContextType;

    const clicked = () => clear();

    return (
        <span className="back-btn" onClick={clicked}>
            <span className="akar-icons--arrow-back-thick"></span>
        </span>
    );
}

export default BackButton;