export interface DashBoardSectionProps extends React.PropsWithChildren{}

const DashBoardSection: React.FC<DashBoardSectionProps> = ({ children }) =>{
    return (
        <div className="sections">{ children }</div>
    );
}

export default DashBoardSection;