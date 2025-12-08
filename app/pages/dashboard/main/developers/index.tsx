import { usePageContext } from "../../../providers/page-provider";
import AllDevelpoers from "./all";
import DeveloperDetails from "./details";
import React from "react";

const Developers = () =>{
    const { pageState } = usePageContext();
    const id = pageState.params;

    return (
        <>
            { !id && <AllDevelpoers /> }
            { id && <DeveloperDetails /> }
        </>
    );
}

export default Developers;