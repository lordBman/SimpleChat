import React from "react";

const Friends = () =>{
    return (
        <div className="chats-main-container">
            <div>
                <h2 className="chats-title">Friends</h2>
            </div>
            <form id="friend-search-form" className="search-form">
                <span className="formkit--search"></span>
                <input id="search-users-input" className="search-input" type="search" placeholder="search users ..." />
            </form>
            <div id="friends-list"></div>
            <div id="friends-search-loading" style={{ display: "none" }}>
                <span>Loading...</span>
            </div>
            <div id="friends-search-results" style={{ display: "none" }}></div>
        </div>
    );
}

export default Friends;