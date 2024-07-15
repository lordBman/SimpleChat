import { MainContext, MainContextType, MainPage } from "../../providers/main-provider";
import React from "react";
import Chat from "./chat";

const Main = () =>{
    const { main } = React.useContext(MainContext) as MainContextType;

    switch(main){
        case MainPage.Chat:
            return <Chat />
    }
    return <></>;
}

export default Main;