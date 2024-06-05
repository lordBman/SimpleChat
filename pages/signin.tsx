import { useMutation } from "react-query";
import { axiosInstance } from "./utils";

const Signin = () =>{

    const registerMutation = useMutation({
        mutationKey: ["user"],
        mutationFn: ()=> axiosInstance.post("/auth"),
    });

    const loginMutation = useMutation({
        mutationKey: ["user"],
        mutationFn: ()=> axiosInstance.post("/auth/login"),
    });

    const register = (event: React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault();

        registerMutation.mutate();
    }

    const login = (event: React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
    }

    return (
        <div>
            <div>
                <form method="POST" onSubmit={register} action="/auth">
                    <label htmlFor="name">Name:</label>
                    <input id="name"  name="name" type="text" placeholder="Name" />

                    <label htmlFor="email">Email:</label>
                    <input id="email"  name="email" type="email" placeholder="Enter email address" />

                    <label htmlFor="password">Password:</label>
                    <input id="password" name="password" type="password" placeholder="Password" />

                    <button type="submit">sign up</button>
                </form>
            </div>

            <div>
                <form method="POST" onSubmit={login} action="/auth/login">
                    <label htmlFor="email">Email:</label>
                    <input id="email"  name="email" type="email" placeholder="Enter email address" />

                    <label htmlFor="password">Password:</label>
                    <input id="password" name="password" type="password" placeholder="Password" />

                    <button type="submit">signin</button>
                </form>
            </div>
        </div>
    );
}

export default Signin;