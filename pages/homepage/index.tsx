import Header from "./header";
import About from "./about";
import Features from "./features";
import Footer from "./footer";

import "../css/home/main.scss";

const Homepage  = () =>{
    return (
        <>
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
        </>
    );
}

export default Homepage;