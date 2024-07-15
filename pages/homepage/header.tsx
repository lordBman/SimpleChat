import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { axiosInstance } from "../utils";

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

    const initQuery = useQuery({
        queryKey: ['developer'],
        queryFn: () => axiosInstance.get('/developer'),
    });

    const logoutMutation = useMutation({
        mutationKey: ['developer'],
        mutationFn: () => axiosInstance.get('/auth/logout'),
        onSuccess: () => {
            window.location.reload();
        },
        onError: ((error)=> alert(error))
    });

    const init = useCallback(()=>{
        if(header.current){
            console.log("socdcmdvodvd");
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

    const signout = () => logoutMutation.mutate();

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
            { !initQuery.data?.data && <a href="/signin" className="options-signin">Sign In</a> }
            { initQuery.data?.data && (
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