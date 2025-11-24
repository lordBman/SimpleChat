import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import { useCallbackRequest, useRequest } from "simplechat_provider/src/request";
import { apiClientInstance } from "../utils";
import { User } from "@simplechat/shared/models";

const Header = (props:{active?: string}) =>{
    const [active, setActive] = useState(props.active || "about");

    const header = useRef<HTMLHeadElement>(null);

    const handleClickScroll = (id: string) =>{
        const element = document.getElementById(id);
        if(element){
            element.scrollIntoView({behavior: "smooth"});
            setActive(id);
        }
    }

    const initQuery = useRequest<User>({
        fn: () => apiClientInstance.get("/auth/me")
    });

    const logoutMutation = useCallbackRequest<void, void>({
        request: () => apiClientInstance.get(`/auth/logout`),
        onDone: () => {
            window.location.reload();
        },
        onFail: ((error)=> alert(error))
    });

    const init = useCallback(()=>{
        if(header.current){
            window.addEventListener("scroll", function (){
                if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
                    header.current?.classList.remove("header-transparent");
                    header.current?.classList.add("header-light");
                } else {
                    header.current?.classList.remove("header-light");
                    header.current?.classList.add("header-transparent");
                }

                let current:string = "";
                let sections = document.querySelectorAll("section");
                sections.forEach((section) => {
                    const sectionTop = section.offsetTop;
                    if (this.scrollY >= sectionTop - 60) {
                        let init = section.id;
                        current = init == null ? "" : init;
                    }
                });

                if(current !== ""){
                    setActive(current);
                }
            });
        }
    }, [header.current]);

    useEffect(()=> init(), [init, header.current]);

    const signout = () => logoutMutation.start();
    const scrollToAbout = () => handleClickScroll("about");
    const scrollToFeatures = () => handleClickScroll("features");
    const scrollToContacts = () => handleClickScroll("contacts");

    return (
        <header className="header-transparent" ref={header}>
            <h3 className="title"><span className="cbi--iris-group"></span> Simple Chat</h3>
            <div className="options">
                <a className={active === "about" ? "active" : ""} onClick={scrollToAbout}>About</a>
                <a className={active === "features" ? "active" : ""} onClick={scrollToFeatures}>Features</a>
                <a href="/docs">Docs</a>
                <a className={active === "contacts" ? "active" : ""} onClick={scrollToContacts}>Contacts</a>
            </div>
            { !initQuery.data && <a href="/signin" className="options-signin">Sign In</a> }
            { initQuery.data && (
                <div className="options options-icon">
                    <a className="options-signin" href="/dashboard">
                        <span className="hugeicons--dashboard-square-02"></span>
                    </a>
                    <a className="options-signin" href="/chats">
                        <span className="fluent--chat-20-regular"></span>
                    </a>
                    <a className="options-signin">
                        <span className="solar--bell-linear"></span>
                    </a>
                    <a className="options-signin" onClick={signout}>
                        <span className="solar--exit-outline"></span>
                    </a>
                </div>
            ) }
        </header>
    );
}

export default Header;