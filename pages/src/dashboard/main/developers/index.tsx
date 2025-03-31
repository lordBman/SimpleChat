import { Route, Switch } from "react-router-dom";
import AllDevelpoers from "./all";
import DeveloperDetails from "./details";
import React from "react";

const Developers = () =>{
    return (
        <Switch>
            <Route exact path="/dashboard/developers">
                <AllDevelpoers />
            </Route>
            <Route path="/dashboard/developers/:id">
                <DeveloperDetails />
            </Route>
        </Switch>
    );
}

export default Developers;