import { Route, Switch } from "react-router-dom";
import Chats from "./chats";
import Groups from "./connections";
import Info from "./info";
import Settings from "./settings";
import Connections from "./connections";
import React from "react";

const Sections = () =>{
    return (
        <Switch>
            <Route path="/dashboard/chats">
                <Chats />
            </Route>
                <Route path="/dashboard/groups">
            <Groups />
            </Route>
            <Route path="/dashboard/connections">
                <Connections />
            </Route>
            <Route path="/dashboard/settings">
                <Settings />
            </Route>
            <Route path="/dashboard/info">
                <Info />
            </Route>
        </Switch>
    );
}

export default Sections;