import Header from "./header";
import About from "./about";
import Features from "./features";
import Footer from "./footer";

import "../css/home/main.scss";
import { QueryClient, QueryClientProvider } from "react-query";

const Homepage  = () =>{
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <Header />
            <div id="content-container">
                <section id="about">
                    <About/>
                </section>
                <section id="features">
                    <Features />
                </section>
                <section id="contacts">
                    <Footer />
                </section>
            </div>
        </QueryClientProvider>
    );
}

export default Homepage;