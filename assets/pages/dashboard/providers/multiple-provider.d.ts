import React from "react";
export interface MultiProviderProps extends React.PropsWithChildren {
    providers: React.FC<React.PropsWithChildren>[];
}
declare const MultiProvider: React.FC<MultiProviderProps>;
export default MultiProvider;
