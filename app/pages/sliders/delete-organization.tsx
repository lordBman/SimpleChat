import React from "react";
import { useSlidersContext } from "../providers/slider-provider";
import SlideInTab from "./slidein-tab";
import Organization from "@simplechat/shared/models/organization";

interface DeleteOrganizationProps {
    organization: Organization
    done: (key: Organization) => void;
    isOpen?: boolean;
}

const DeleteOrganization: React.FC<DeleteOrganizationProps> = ({ organization, done, isOpen }) =>{
    const { closeSlide } = useSlidersContext();
    
    return (
        <SlideInTab title="Delete Access Key" onClose={closeSlide} isOpen={isOpen ?? false}>
            
        </SlideInTab>
    );
}

export default DeleteOrganization;