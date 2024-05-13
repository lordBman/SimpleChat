import React, { useState } from "react";

import Sections from "./sections";

import Menu from "../conponents/menu";
import Main from "./main";
import { QueryClient, QueryClientProvider } from "react-query";
import ProviderWraper, { AppProvider } from "./providers";
import { PuffLoader } from "react-spinners";
import "../css/main.scss";
import { BottomNavigation } from "../conponents";

const Loading = () =>{
    return (
        <div style={{ display:"flex", width: "100dvw", height: "100dvh", backgroundColor: "white", alignItems: "center", justifyContent: "center" }}>
            <PuffLoader color="#36d7b7" />
        </div>
    );
}

const DeskTop = () =>{
    return (
        <div id="content" className="content">
            <Menu />
            <Sections />
            <Main />
            <BottomNavigation />
        </div>
    );
}

const App = () =>{
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <AppProvider>
                <ProviderWraper Loading={Loading}>
                    <DeskTop />
                </ProviderWraper>
            </AppProvider>
        </QueryClientProvider>
    );
}

export default App;