import React, { ReactElement } from "react";

interface ToolBarItemProps{
    icon: string,
    id: string,
    choose?: (id: string) => void,
}

const ToolBarItem: React.FC<ToolBarItemProps> = ({ id, icon, choose }) =>{
    const clicked = ()=> choose && choose(id);

    return (
        <div onClick={clicked}>
            <span className={icon}></span>
        </div>
    );
}


interface ToolBarProps{
    children: Array<ReactElement<ToolBarItemProps>>
    chosen?: (id: string) => void,
}

const ToolBar: React.FC<ToolBarProps> & { Item: React.FC<ToolBarItemProps> } = ({ children }) =>{
    return (
        <div>{children}</div>
    );
}

ToolBar.Item = ToolBarItem;

export default ToolBar;