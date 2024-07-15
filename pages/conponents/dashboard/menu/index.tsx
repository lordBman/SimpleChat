import React, { ReactElement, useMemo, useState } from "react";
import Options, { OptionsItem, OptionsItemProps, OptionsProps } from "./options";
import "../../../css/menu.scss";

export interface MenuProps{
    initial: string,
    children: Array<ReactElement<OptionsProps>>,
    choose?: (id: string) => void,
}

const Menu: React.FC<MenuProps> & { Options: React.FC<OptionsProps>, OptionsItem: React.FC<OptionsItemProps> } = ({ initial, children, choose }) =>{
    const [active, setActive] = useState(initial);

    const onChoose = (id: string) =>{
        setActive(id);
        if(choose){
            choose(id);
        }
    }

    const finalChildren =  useMemo(()=>{
        return children.map((child) => {
            return React.cloneElement(child, { choose: onChoose, active, key: child.key });
        });
    }, [active]);

    return (
        <div className="menu">
            <div className="options">
                <div className="icon">
                    <span className="cbi--iris-group"></span>
                    <div className="menu-title">Simple Chat</div>
                </div>
            </div>
            { finalChildren }
        </div>
    );
}

Menu.Options = Options;
Menu.OptionsItem = OptionsItem;

export default Menu;