import React from "react";
import { useParams } from "react-router-dom";

const DeveloperDetails = () =>{
    const params = useParams<{id: string}>();
    return (
        <div>Developers details - {params.id}</div>
    );
}

export default DeveloperDetails;