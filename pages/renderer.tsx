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
                <link rel="stylesheet" href="/assets/css/main.css" />
                <link rel="stylesheet" href="/assets/css/icons.css" />
                <link rel="stylesheet" href="/assets/css/friends.css" />
                <link rel="stylesheet" href="/assets/css/profile.css" />
                <link rel="stylesheet" href="/assets/css/chat.css" />
                <link rel="stylesheet" href="/assets/css/chats.css" />
                <link rel="stylesheet" href="/assets/css/loading.css" />
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
                <link rel="stylesheet" href="/assets/css/signin.css" />
                <link rel="stylesheet" href="/assets/css/icons.css" />
                <link rel="stylesheet" href="/assets/css/loading.css" />
            </head>
            <body>
                <main id="root">${root}</main>
                <script src="/assets/signin.js"></script>
            </body>
        </html>
    `;
    res.status(200).contentType("text/html").send(Buffer.from(html));
}