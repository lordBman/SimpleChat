import ReactDOMServer from "react-dom/server";
import { Response } from "express";
import App from "./dashboard";

const renderReact = (name: string, res: Response, element: JSX.Element, initialData?: any) =>{
    const root = ReactDOMServer.renderToString(element);

    const html = `
        <html lang="en">
            <body>
                <main data-page="${name}" id="root">${root}</main>
                <script>
                    const initialData = ${JSON.stringify(initialData)}
                </script>
                <script src="/assets/bundle.js"></script>
            </body>
        </html>
    `;
    res.status(200).contentType("text/html").send(Buffer.from(html));
}

export { App };

export default renderReact;