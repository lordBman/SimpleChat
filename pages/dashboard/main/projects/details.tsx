import { useParams } from "react-router-dom";

const ProjectDetails = () =>{
    const params = useParams<{id: string}>();
    
    return (
        <div>project details - {params.id}</div>
    );
}

export default ProjectDetails;