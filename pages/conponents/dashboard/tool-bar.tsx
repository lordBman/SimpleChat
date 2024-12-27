import React, { ReactElement } from "react";

export interface ToolBarItemProps{
    icon: string,
    id: string,
    label?: string 
    choose?: (id: string) => void,
}

export const ToolBarItem: React.FC<ToolBarItemProps> = ({ id, icon, choose, label }) =>{
    const clicked = ()=> choose && choose(id);

    return (
        <div className="tool-bar-item" onClick={clicked}>
            <span className={icon}></span>
            { label && <span style={{ marginLeft: 10, fontSize: 16 }} >{label}</span> }
        </div>
    );
}


export interface ToolBarProps{
    children: Array<ReactElement<ToolBarItemProps>>
    title: string
    chosen?: (id: string) => void,
}

const ToolBar: React.FC<ToolBarProps> & { Item: React.FC<ToolBarItemProps> } = ({ title, children }) =>{
    return (
        <div className="tool-bar">
            <h2 style={{ color: "whitesmoke" }}>{title}</h2>
            <div className="tool-bar-item-container">{children}</div>
        </div>
    );
}

ToolBar.Item = ToolBarItem;

export default ToolBar;