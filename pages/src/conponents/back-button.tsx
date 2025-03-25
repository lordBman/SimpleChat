import "../css/chats/back-button.scss";
import { useHistory } from "react-router-dom";

const BackButton = () =>{
    const history = useHistory();

    const clicked = () => history.goBack();

    return (
        <span className="back-btn" onClick={clicked}>
            <span className="akar-icons--arrow-back-thick"></span>
        </span>
    );
}

export default BackButton;