import { QueryClient, QueryClientProvider, useMutation } from "react-query";
import { axiosInstance, extract } from "./utils";
import { useState } from "react";

const Signin = () =>{
    const [error, setError] = useState<any>();

    const done = ()=>{
        if(window.location.pathname.endsWith("signin")){
            window.location.replace("/");
        }else{
            window.location.reload();
        }
    }

    const registerMutation = useMutation({
        mutationKey: ["user"],
        mutationFn: (data: {name: string, email: string, password: string })=> axiosInstance.post("/auth/user", { ...data, key: "b791fa6f9ff96a4ced89de287456ad5baf3a"}),
        onSuccess: done,
        onError: (error)=> setError(error)
    });

    const loginMutation = useMutation({
        mutationKey: ["user"],
        mutationFn: (data: { email: string, password: string })=> axiosInstance.post("/auth/user/login", { ...data, key: "b791fa6f9ff96a4ced89de287456ad5baf3a"}),
        onSuccess: done,
        onError: (error)=> setError(error)
    });

    const register = (event: React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault();

        const data = extract(event.currentTarget);
        registerMutation.mutate({ name: data["name"], email: data["email"], password: data["password"] });
    }

    const login = (event: React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault();

        const data = extract(event.currentTarget);

        loginMutation.mutate({ email: data["email"], password: data["password"] });
    }

    const loading = loginMutation.isLoading || registerMutation.isLoading;

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

                    <button type="submit" disabled={loading}>{registerMutation.isLoading ? "loading" : "sign up"}</button>
                </form>
            </div>

            <div>
                <form method="POST" onSubmit={login}>
                    <label htmlFor="email">Email:</label>
                    <input id="email"  name="email" type="email" placeholder="Enter email address" />

                    <label htmlFor="password">Password:</label>
                    <input id="password" name="password" type="password" placeholder="Password" />

                    <button type="submit" disabled={loading}>{loginMutation.isLoading ? "loading" : "login"}</button>
                </form>
            </div>
            <div>Error: {error}</div>
        </div>
    );
}

const App = () =>{
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <Signin />
        </QueryClientProvider>
    );
}
export default App;