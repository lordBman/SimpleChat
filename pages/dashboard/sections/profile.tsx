import React from "react";
import "../../../assets/css/profile.css";

interface ProfileProps{
    name: string,
    email: string,
}

const Profile: React.FC<ProfileProps> = ({ name, email }) =>{
    return (
        <div className="profile-main-container">
            <div className="profile-title-container">
                <h2 className="profile-title">Profile</h2>
                <span className="circum--menu-kebab profile-title-menu"></span>
            </div>

            <div className="profile-container">
                <div style={{ display: "flex", alignItems:"center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
                    <div id="profile-picture">{ name.charAt(0).toUpperCase() }</div>
                    <div id="profile-name">{name}</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center"}}>
                        <div style={{ border: "solid 3px #06D6A3; border-radius:50%" }}>
                            <div style={{ width:2, height:2, backgroundColor: "white", borderRadius:"50%" }}></div>
                        </div>
                        <div style={{ color: "grey", fontSize: 16 }}>Active</div>
                    </div>
                </div>
                <p style={{ color: "grey" }}>
                    If several languages coalesce, the grammar of the resulting language is more simple and regular than that of the individual.
                </p>
                <div className="about-container">
                    <div className="about-container-section">
                        <span className="guidance--user-1"></span>
                        <div>About</div>
                    </div>
                    <div className="about-container-item">
                        <div className="title">Name</div>
                        <div>{ name}</div>
                    </div>
                    <div className="about-container-item">
                        <div className="title">Email</div>
                        <div>{email}</div>
                    </div>
                    <div className="about-container-item">
                        <div className="title">Time</div>
                        <div>19:38 AM</div>
                    </div>
                    <div className="about-container-item last">
                        <div className="title">Location</div>
                        <div>Lagos Nigeria</div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Profile;