import React from "react";

const About = () =>{
    return (
        <div className="about-container">
            <h3 className="welcome-title"><span className="cbi--iris-group logo"></span> Simple Chat</h3>
            <p className="description">
                Welcome to Simple Chat, a powerful platform designed to empower developers with seamless integration of chat functionality into applications, 
                websites, and mobile apps. Unlike other Chat APIs that limit flexibility by offering pre-built widgets and managing communications, Simple Chat ensures real-time, fast message delivery while 
                also allowing you to fully tailor the chat interface to match your unique requirements.
            </p>
            <div className="started-btn">Get Started</div>
        </div>
    );
}

export default About;