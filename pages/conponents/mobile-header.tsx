import React from "react";
import "../css/mobile-header.scss";

const MobileHeader = () =>{
    return (
        <div className="mobile-header">
            <span className="cbi--iris-group"></span>
            <div className="mobile-header-options">
                <span className="solar--bell-linear"></span>
                <span className="solar--exit-outline"></span>
                <span className="clarity--help-info-line"></span>
            </div>
        </div>
    );
}

export default MobileHeader;