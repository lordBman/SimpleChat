import { DashBoard } from "../conponents";
import Options from "../conponents/dashboard/menu/options";

const Developer = ()=>{
    return (
        <DashBoard>
            <DashBoard.Menu initial="home">
                <Options>
                    <Options.Item id="home" isMiddle icon="solar--home-linear" label="Home" />
                    <Options.Item id="profile" isMiddle icon="guidance--user-1" label="Profile" />
                </Options>
                <Options>
                    <Options.Item id="settings" icon="et--gears" label="Settings" />
                    <Options.Item id="logout" icon="solar--exit-outline" label="Logout" />
                    <Options.Item id="info" icon="clarity--help-info-line" label="Info" />
                </Options>    
            </DashBoard.Menu>
            <DashBoard.Content>
                Dashboard
            </DashBoard.Content>
        </DashBoard>
    );
}

export default Developer;