import Chat from "./chat";
import { useLocation } from "react-router-dom";
import Home from "./home";

const Main = () =>{
    const location = useLocation();

    const current = location.pathname.split("/")[1]

    switch(current){
        case "":
            return <Chat />
        default:
            return <Home />
    }
    return <Home />;
}

export default Main;