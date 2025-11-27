import React from "react";
import { useAppContext } from "../../../providers/app-provider";

const DeveloperDetails = () =>{
    const { pageState } = useAppContext();
    const id = pageState.params || "unknown";

    return (
        <div>Developers details - {id}</div>
    );
}

export default DeveloperDetails;