import React from "react";

const Groups = () =>{
    return (
        <div className="chats-main-container">
            <div>
                <h2 className="chats-title">Groups</h2>
            </div>
            <form className="search-form">
                <span className="formkit--search"></span>
                <input id="search-groups" className="search-input" type="search" placeholder="search groups ..." />
            </form>
        </div>
    );
}

export  default Groups;