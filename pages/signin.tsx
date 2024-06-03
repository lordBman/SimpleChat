const Signin = () =>{
    return (
        <div>
            <div>
                <form method="POST" action="/users">
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
                <form method="POST" action="/users/login">
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