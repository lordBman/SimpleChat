import React, { useState } from "react";

export type SliderOptions = "createKey" | "deleteKey" | "notifications" | "createOrganization" | "deleteOrganization" | "none";

export interface SlidersContextType {
    openSlide: (option: SliderOptions) => void;
    currentSlide: SliderOptions;
    closeSlide: () => void;
}

export const SlidersContext = React.createContext<SlidersContextType | null>(null);
export const useSlidersContext = () => {
    const init = React.useContext(SlidersContext);
    if(init === null){
        throw Error("Component has to be wrapped by SlidersProvider in order to call SlidersContext");
    }
    return init;
}

const SlidersProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [currentOption, setCurrentOption] = useState<SliderOptions>("none");

    const openSlide = (option: SliderOptions) => {
        setCurrentOption(option);
    };

    const closeSlide = () => {
        setCurrentOption("none");
    };

    return (
        <SlidersContext.Provider value={{ openSlide, currentSlide: currentOption, closeSlide }}>
            {children}
        </SlidersContext.Provider>
    );
}

export default SlidersProvider;