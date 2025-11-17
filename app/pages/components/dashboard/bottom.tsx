import React from "react"
import "../../css/bottom-navigation.scss";      

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

export interface BottomNavigationProps{
    children: Array<React.ReactElement<BottomNavigationItemProps>>,
    choose?: (id: string) =>void,
    active: string
}

const BottomNavigation: React.FC<BottomNavigationProps> & { Item: React.FC<BottomNavigationItemProps> } = ({ children, choose, active }) =>{
    const chosen = (id: string)=> choose && choose(id);

    const finalChildren = children.map((child)=>{
        return React.cloneElement(child, { active, onClicked: chosen, key: child.key });
    })

    return (
        <div className="bottom-navigation">
            { finalChildren }
        </div>
    );
}

BottomNavigation.Item = BottomNavigationItem;

export default BottomNavigation;