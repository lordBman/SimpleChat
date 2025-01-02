import React from "react";

export interface MultiProviderProps extends React.PropsWithChildren{
    providers: React.FC<React.PropsWithChildren>[],
}
  
const MultiProvider: React.FC<MultiProviderProps> = ({ providers, children }) => {
    return providers.reduceRight((child, Provider) => <Provider>{child}</Provider>, children);
};

export default MultiProvider;