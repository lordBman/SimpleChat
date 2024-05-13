import ReactDOMServer from "react-dom/server";
import { Response } from "express";
import DashBoard from "./dashboard";
import React from "react";
import Signin from "./signin";

export const dashboardRenderer = (res: Response) =>{
    const root = ReactDOMServer.renderToString(<DashBoard />);

    const html = `
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/css/icons.css" />
            </head>
            <body>
                <main id="root">${root}</main>
                <script src="/assets/dashboard.js"></script>
            </body>
        </html>
    `;
    res.status(200).contentType("text/html").send(Buffer.from(html));
}

export const signinRenderer = (res: Response) =>{
    const root = ReactDOMServer.renderToString(<Signin />);

    const html = `
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/css/icons.css" />
            </head>
            <body>
                <main id="root">${root}</main>
                <script src="/assets/signin.js"></script>
            </body>
        </html>
    `;
    res.status(200).contentType("text/html").send(Buffer.from(html));
}