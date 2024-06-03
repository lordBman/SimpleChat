import React from "react"
import "../css/chats/bottom-navigation.scss";      
import { MainContext, MainContextType } from "../chat/providers/main-provider";

interface BottomNavigationItemProps{active?: string, icon: string, label:string, id: string, onClicked?: CallableFunction }

const BottomNavigationItem: React.FC<BottomNavigationItemProps> = ({ icon, label, id, onClicked, active }) =>{
    const chosen = ()=> onClicked && onClicked(id);
    const className = "bottom-navigation-item" + (active === id ? " active" : "");

    return (
        <div onClick={chosen} className={className}>
            <span className={icon}></span>
            <div className="bottom-navigation-title">{label}</div>
        </div>
    )
}


const BottomNavigation = () =>{
    const { section, setSection } = React.useContext(MainContext) as MainContextType;

    const chosen = (id: string)=> setSection(id);

    return (
        <div className="bottom-navigation">
            <BottomNavigationItem id="profile" icon="guidance--user-1" label="Profile" onClicked={chosen} active={section}/>
            <BottomNavigationItem id="chats" icon="fluent--chat-20-regular" label="Chats" onClicked={chosen} active={section}/>
            <BottomNavigationItem id="groups" icon="heroicons--user-group" label="Groups" onClicked={chosen} active={section}/>
            <BottomNavigationItem id="friends" icon="system-uicons--contacts" label="Friends" onClicked={chosen} active={section}/>
            <BottomNavigationItem id="settings" icon="et--gears" label="Settings" onClicked={chosen} active={section}/>
        </div>
    );
}

export default BottomNavigation;