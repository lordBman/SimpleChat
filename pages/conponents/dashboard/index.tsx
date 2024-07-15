import React, { ReactElement } from "react";
import Menu, { MenuProps } from "./menu";
import DashBoardSection, { DashBoardSectionProps } from "./section";
import DashboardContent, { DashboardContentProps } from "./content";
import "../../css/dashboard.scss";
import BottomNavigation, { BottomNavigationProps } from "./bottom";

export interface DashBoardProps {
    children: Array<ReactElement<DashBoardSectionProps> | ReactElement<DashboardContentProps> | ReactElement<MenuProps> | ReactElement<BottomNavigationProps>>
}

const DashBoard: React.FC<DashBoardProps> & { Menu: React.FC<MenuProps>, Section: React.FC<DashBoardSectionProps>, Content: React.FC<DashboardContentProps>, Bottom: React.FC<BottomNavigationProps> } = ({ children }) =>{
   
    let menu: ReactElement<MenuProps> | undefined;
    let section: ReactElement<DashBoardSectionProps> | undefined;
    let content: ReactElement<DashboardContentProps> | undefined;
    let bottom: ReactElement<BottomNavigationProps> | undefined;
  
    children?.map((child) => {
        if(child.type === DashBoardSection) {
            section = child as ReactElement<DashBoardSectionProps>;
        }else if (child.type === DashboardContent) {
            content = child as ReactElement<DashboardContentProps>;
        }else if (child.type === Menu){
            menu = child as ReactElement<MenuProps>;
        }else if(child.type === BottomNavigation){
            bottom = child as ReactElement<BottomNavigationProps>;
        }
    });
    
    return (
        <div className="dashboard">
            { menu } { section } { content } { bottom }
        </div>
    );
}

DashBoard.Content = DashboardContent;
DashBoard.Menu = Menu;
DashBoard.Section = DashBoardSection;
DashBoard.Bottom = BottomNavigation;


export default DashBoard;