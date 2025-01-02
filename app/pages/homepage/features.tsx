import "../css/home/features.scss";

const Features = () =>{
    return (
        <div className="features">
            <div className="feature-image-container">
                <img className="feature-image" src="/assets/images/undraw_developer_activity_re_39tg.svg" />
            </div>
            <div className="feature-contents">
                <div className="feature-item feature-item-left-padding">
                    <div className="feature-item-left">
                        <div className="feature-item-circle">
                            <span className="streamline--desktop-chat"></span>
                        </div>
                        <p>
                            Our API streamlines the integration process by providing straightforward endpoints and comprehensive documentation, ensuring a smooth 
                            implementation experience.
                        </p>
                    </div>
                    <div className="feature-item-left">
                        <div className="feature-item-circle">
                            <span className="solar--chat-square-code-line-duotone"></span>
                        </div>
                        <p>
                            Whether you're developing a messaging feature for a social platform, facilitating team collaboration within a business application, 
                            or fostering community engagement on a website.
                        </p>
                    </div>
                </div>
                <div className="feature-line"></div>
                <div className="feature-item feature-item-right-padding">
                    <div className="feature-item-right">
                        <div className="feature-item-circle">
                            <span className="fa6-solid--people-group"></span>
                        </div>
                        <p>
                            To enhance customization and personalization, developers can include essential user details, such as client name and platform identifier, 
                            along with optional organizational information.
                        </p>
                    </div>
                    <div className="feature-item-right">
                        <div className="feature-item-circle">
                            <span className="clarity--devices-solid"></span>
                        </div>
                        <p>
                            Explore our documentation to access detailed guides, comprehensive API references, and practical code examples, accelerating the 
                            integration process and unlocking the full potential of chat functionality in your applications.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Features;