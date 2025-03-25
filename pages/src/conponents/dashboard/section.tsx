export interface DashBoardSectionProps extends React.PropsWithChildren{
    hide?: boolean
}

const DashBoardSection: React.FC<DashBoardSectionProps> = ({ children, hide }) =>{
    return (
        <div className="sections" style={{ display: hide ? "none" : "flex" }}>{ children }</div>
    );
}

export default DashBoardSection;