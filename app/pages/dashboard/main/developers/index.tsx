import { useAppContext } from "../../../providers/app-provider";
import AllDevelpoers from "./all";
import DeveloperDetails from "./details";
import React from "react";

const Developers = () =>{
    const { pageState } = useAppContext();
    const id = pageState.params;

    return (
        <>
            { !id && <AllDevelpoers /> }
            { id && <DeveloperDetails /> }
        </>
    );
}

export default Developers;