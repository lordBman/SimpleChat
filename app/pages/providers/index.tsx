import React from "react";
import AppProviderWraper  from "./app-provider";
import PageProvider from "./page-provider";
import SlidersProvider from "./slider-provider";

interface MultiProviderProps extends React.PropsWithChildren{
    providers: React.FC<React.PropsWithChildren>[],
}
  
export const MultiProvider: React.FC<MultiProviderProps> = ({ providers, children }) => {
    return providers.reduceRight((child, Provider) => <Provider>{child}</Provider>, children);
};

export { AppProviderWraper, PageProvider, SlidersProvider }