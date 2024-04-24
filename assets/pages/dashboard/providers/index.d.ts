import React from "react";
import { PropsWithChildren } from "react";
import AppProvider from "./app-provider";
interface ProviderWraperProps extends PropsWithChildren {
    Loading: React.FC<PropsWithChildren>;
}
declare const ProviderWraper: React.FC<ProviderWraperProps>;
export { AppProvider };
export default ProviderWraper;
