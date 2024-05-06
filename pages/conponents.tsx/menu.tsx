import React from "react";
import { useMutation } from "react-query";
import { axiosInstance } from "../utils";

interface MenuItemProps{active?: string, isMiddle?: boolean, icon: string, label:string, id: string, onClicked?: CallableFunction }

const MenuItem: React.FC<MenuItemProps> = ({ isMiddle, icon, label, id, onClicked, active }) =>{
    const chosen = ()=> onClicked && onClicked(id);
    const className = (isMiddle ? "menu-item menu-item-middle" : "menu-item") + (active === id ? " active" : "");

    return (
        <div onClick={chosen} className={className}>
            <span className={icon}></span>
            <div className="menu-title">{label}</div>
        </div>
    )
}

const Menu: React.FC<{active: string, onClicked?: CallableFunction }> = ({ active, onClicked }) =>{
    const chosen = (id: string)=> onClicked && onClicked(id);
    const logoutMutation = useMutation({
        mutationKey:["data"],
        mutationFn: ()=> axiosInstance.get("users/logout"),
        onSuccess: ()=>{
            window.location.reload();
        }
    });

    const logout = () => logoutMutation.mutate();

    return (
        <div className="menu">
            <div className="options">
                <div className="icon">
                    <span className="cbi--iris-group"></span>
                    <div className="menu-title">Simple Chat</div>
                </div>
            </div>
            <div className="options">
                <MenuItem id="profile" isMiddle icon="guidance--user-1" label="Profile" onClicked={chosen} active={active}/>
                <MenuItem id="chats" isMiddle icon="fluent--chat-20-regular" label="Chats" onClicked={chosen} active={active}/>
                <MenuItem id="notifications" isMiddle icon="solar--bell-linear" label="Notifications" onClicked={chosen} active={active}/>
                <MenuItem id="groups" isMiddle icon="heroicons--user-group" label="Groups" onClicked={chosen} active={active}/>
                <MenuItem id="friends" isMiddle icon="system-uicons--contacts" label="Friends" onClicked={chosen} active={active}/>
            </div>
            <div className="options">
                <MenuItem id="settings" icon="et--gears" label="Settings" onClicked={chosen} active={active}/>
                <MenuItem id="logout" icon="solar--exit-outline" label="Logout" onClicked={logout} active={active}/>
                <MenuItem id="info" icon="clarity--help-info-line" label="Info" onClicked={chosen} active={active}/>
            </div>
        </div>
    );
}

export default Menu;