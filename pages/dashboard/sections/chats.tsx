import React from "react";

const Chats = () =>{
    return (
        <div className="chats-main-container">
            <div>
                <h2 className="chats-title">Chats</h2>
            </div>
            <form className="search-form">
                <span className="formkit--search"></span>
                <input className="search-input" type="search" placeholder="search users ..." />
            </form>
            <div className="messages-root-container">
                <h4 className="messages-title">Messages</h4>
                <div className="messages-main">
                    <div className="messages-container">
                        <div className="messages-item">
                            <div className="messages-item-profile-container">
                                <div className="messages-item-profile">N</div>
                                <div className="messages-item-status-container">
                                    <div className="messages-item-status"></div>
                                </div>
                            </div>
                            <div className="messages-item-content">
                                <div className="messages-item-name-container">
                                    <span className="messages-item-name">Blessing James</span>
                                    <span className="messages-item-time">12:14pm</span>
                                </div>
                                <span className="messages-item-message">Hoew are you doing ? </span>
                            </div>
                        </div>
                        <div className="messages-item">
                            <div className="messages-item-profile-container">
                                <div className="messages-item-profile">N</div>
                                <div className="messages-item-status-container">
                                    <div className="messages-item-status"></div>
                                </div>
                            </div>
                            <div className="messages-item-content">
                                <div className="messages-item-name-container">
                                    <span className="messages-item-name">Blessing James</span>
                                    <span className="messages-item-time">12:14pm</span>
                                </div>
                                <span className="messages-item-message">Hoew are you doing ? </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chats;