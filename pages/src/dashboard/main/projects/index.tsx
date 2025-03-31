import { Route, Switch } from "react-router-dom";
import AllProjects from "./all";
import ProjectDetails from "./details";
import React from "react";

const Projects = () =>{
    return (
        <Switch>
            <Route exact path="/dashboard/projects">
                <AllProjects />
            </Route>
            <Route path="/dashboard/projects/:id">
                <ProjectDetails />
            </Route>
        </Switch>
    );
}

export default Projects;