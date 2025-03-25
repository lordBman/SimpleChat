import Chat from "./chat";
import { useLocation } from "react-router-dom";
import Home from "./home";
import Projects from "./projects";
import Developers from "./developers";

const Main = () =>{
    const location = useLocation();

    const current: String = location.pathname.split("/")[2];

    switch(current){
        case "chats":
        case "connections":
            return <Chat />
        case "projects":
            return <Projects />
        case "developers":
            return <Developers />
        default:
            return <Home />;
    }
}

export default Main;