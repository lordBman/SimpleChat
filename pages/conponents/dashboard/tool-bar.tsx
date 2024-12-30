import React, { ReactElement, useMemo } from "react";

const paragraph = (word: string): string =>{
    return word.replace(word.charAt(0), word.charAt(0).toUpperCase());
}

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
    const current  = useMemo(()=>{
        const paths =  location.pathname.split('/');

        let currents: string[] =  [];
        for(let i = 2; i < paths.length; i++){
            if(paths[i] && paths[i] !== ""){
                currents.push(paths[i])
            }else{
                if(currents.length === 0){
                    currents = ["Home"];
                }
                break;
            }
        }
        
        return currents;
    }, [location.pathname]);
    
    return (
        <div className="tool-bar">
            <h2 style={{ color: "whitesmoke" }}>{title} { current.map((init)=>(<span style={{ fontWeight: 200, fontSize: 18, fontFamily: "monospace" }}> | {paragraph(init)}</span>)) }</h2>
            <div className="tool-bar-item-container">{children}</div>
        </div>
    );
}

ToolBar.Item = ToolBarItem;

export default ToolBar;