import React from "react";
import { ReactElement } from "react";

export interface OptionsItemProps{active?: string, isMiddle?: boolean, icon: string, label:string, id: string, onClicked?: (id: string) => void }

export const OptionsItem: React.FC<OptionsItemProps> = ({ isMiddle, icon, label, id, onClicked, active }) =>{

    const chosen = ()=> onClicked && onClicked(id);

    const className = (isMiddle ? "menu-item menu-item-middle" : "menu-item") + (active === id ? " active" : "");

    return (
        <div onClick={chosen} className={className}>
            <span className={icon}></span>
            <div className="menu-title">{label}</div>
        </div>
    )
}

export interface OptionsProps{
    active?: string,
    children: Array<ReactElement<OptionsItemProps>>,
    choose?: (id: string) => void,
}

const Options: React.FC<OptionsProps> & { Item: React.FC<OptionsItemProps> } = ({ children, active, choose }) =>{

    const onChoose = (id: string) => choose && choose(id);

    const finalChildren =  children.map((child) => {
        return React.cloneElement(child, { onClicked: onChoose, active, key: child.key });
    });
    
    return (
        <div className="options">{ finalChildren }</div>
    );
}

Options.Item = OptionsItem;

export default Options;