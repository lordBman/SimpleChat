export interface DashboardContentProps extends React.PropsWithChildren{}

const DashboardContent: React.FC<DashboardContentProps> = ({ children }) =>{
    return (
        <div className="content">{ children }</div>
    );
}

export default DashboardContent;