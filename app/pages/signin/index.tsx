import { useCallbackRequest } from "simplechat_provider/src/request";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { apiClientInstance, extract } from "../utils";

const Signin = () =>{
    const [error, setError] = useState<any>();

    const done = ()=>{
        if(window.location.pathname.endsWith("signin")){
            window.location.replace("/");
        }else{
            window.location.reload();
        }
    }

    const registerCallback = useCallbackRequest({
        request: (data: {name: string, email: string, password: string })=> apiClientInstance.post("/auth", { data }),
        onDone: done,
        onFail: (error: any)=> setError(error)
    });

    const loginCallback = useCallbackRequest({
        request: (data: { email: string, password: string })=> apiClientInstance.post("/auth/login", { data }),
        onDone: done,
        onFail: (error)=> setError(error)
    });

    const register = (event: React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault();

        const data = extract(event.currentTarget);
        registerCallback.start({ name: data["name"], email: data["email"], password: data["password"] });
    }

    const login = (event: React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault();

        const data = extract(event.currentTarget);
        loginCallback.start({ email: data["email"], password: data["password"] });
    }

    const loading = loginCallback.loading || registerCallback.loading;

    return (
        <div>
            <div>
                <form method="POST" onSubmit={register}>
                    <label htmlFor="name">Name:</label>
                    <input id="name"  name="name" type="text" placeholder="Name" />

                    <label htmlFor="email">Email:</label>
                    <input id="email"  name="email" type="email" placeholder="Enter email address" />

                    <label htmlFor="password">Password:</label>
                    <input id="password" name="password" type="password" placeholder="Password" />

                    <button type="submit" disabled={loading}>{registerCallback.loading ? "loading" : "sign up"}</button>
                </form>
            </div>

            <div>
                <form method="POST" onSubmit={login}>
                    <label htmlFor="email">Email:</label>
                    <input id="email"  name="email" type="email" placeholder="Enter email address" />

                    <label htmlFor="password">Password:</label>
                    <input id="password" name="password" type="password" placeholder="Password" />

                    <button type="submit" disabled={loading}>{ loginCallback.loading ? "loading" : "login"}</button>
                </form>
            </div>
            <div>Error: {error}</div>
        </div>
    );
}

const element = document.getElementById("root");
if(element){
    const root = createRoot(element);
    root.render( <Signin />);
}else{
    console.log("root element not found");
}