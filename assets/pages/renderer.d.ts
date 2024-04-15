import { Response } from "express";
import App from "./dashboard";
declare const renderReact: (name: string, res: Response, element: JSX.Element, initialData?: any) => void;
export { App };
export default renderReact;
