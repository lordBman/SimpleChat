import React from "react";
import SlideInTab from "./slidein-tab";
import { useSlidersContext } from "../providers/slider-provider";

interface NotificationsProps {
    isOpen?: boolean;
}

const Notifications: React.FC<NotificationsProps> = ({ isOpen }) => {
    const { closeSlide } = useSlidersContext();
    
    return (
        <SlideInTab title="Notifications" isOpen={isOpen ?? false} onClose={closeSlide}>
            
        </SlideInTab>
    );
}

export default Notifications;