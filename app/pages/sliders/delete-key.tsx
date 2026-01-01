import React from "react";
import { useSlidersContext } from "../providers/slider-provider";
import SlideInTab from "./slidein-tab";
import { AccessKey } from "@simplechat/shared/models";

interface DeleteKeyProps {
    accessKey: AccessKey
    done: (key: AccessKey) => void;
    isOpen?: boolean;
}

const DeleteKey: React.FC<DeleteKeyProps> = ({ accessKey, done, isOpen }) =>{
    const { closeSlide } = useSlidersContext();
    
    return (
        <SlideInTab title="Delete Access Key" onClose={closeSlide} isOpen={isOpen ?? false}>

        </SlideInTab>
    );
}

export default DeleteKey;