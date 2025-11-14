import React from "react";
import Header from "./header";
import About from "./about";
import Features from "./features";
import Footer from "./footer";


const Homepage  = () =>{
    return (
        <>
            <Header />
            <div id="content-container">
                <section id="about" style={{ backgroundImage: "url('/assets/images/igor-miske-JVSgcV8_vb4-unsplash.jpg')" }}>
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