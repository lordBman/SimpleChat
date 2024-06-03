import ReactDOMServer from "react-dom/server";
import express, { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import jetLogger from "jet-logger";
import Signin from "./signin";
import Chat from "./chat";
import Homepage from "./homepage";
import DashBoard from "./dashboard";
import Docs from "./docs";

export const chatRenderer = (res: Response) =>{
    const root = ReactDOMServer.renderToString(<Chat/>);

    const html = `
        <html lang="en">
            <head>
                <title>Simple Chat | Chat</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/css/icons.css" />
                <link rel="stylesheet" href="/assets/dist/chat.css" />
            </head>
            <body>
                <main id="root">${root}</main>
                <script src="/assets/dist/chat.js"></script>
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
                <title>Simple Chat | Signin</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/css/icons.css" />
                <link rel="stylesheet" href="/assets/dist/signin.css" />
            </head>
            <body>
                <main id="root">${root}</main>
                <script src="/assets/dist/signin.js"></script>
            </body>
        </html>
    `;
    res.status(200).contentType("text/html").send(Buffer.from(html));
}

export const homepageRenderer = (res: Response) =>{
    const root = ReactDOMServer.renderToString(<Homepage />);

    const html = `
        <html lang="en">
            <head>
                <title>Simple Chat | Home</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/css/icons.css" />
                <link rel="stylesheet" href="/assets/dist/homepage.css" />
            </head>
            <body>
                <main id="root">${root}</main>
                <script src="/assets/dist/homepage.js"></script>
            </body>
        </html>
    `;
    res.status(200).contentType("text/html").send(Buffer.from(html));
}

export const dashboardRenderer = (res: Response) =>{
    const root = ReactDOMServer.renderToString(<DashBoard />);

    const html = `
        <html lang="en">
            <head>
                <title>Simple Chat | Dashboard</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/css/icons.css" />
                <link rel="stylesheet" href="/assets/dist/dashboard.css" />
            </head>
            <body>
                <main id="root">${root}</main>
                <script src="/assets/dist/dashboard.js"></script>
            </body>
        </html>
    `;
    res.status(200).contentType("text/html").send(Buffer.from(html));
}

export const docsRenderer = (res: Response) =>{
    const root = ReactDOMServer.renderToString(<Docs />);

    const html = `
        <html lang="en">
            <head>
                <title>Simple Chat | Documentation</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/css/icons.css" />
                <link rel="stylesheet" href="/assets/dist/docs.css" />
            </head>
            <body>
                <main id="root">${root}</main>
                <script src="/assets/dist/docs.js"></script>
            </body>
        </html>
    `;
    res.status(200).contentType("text/html").send(Buffer.from(html));
}

const secureRoute = async (req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.token){
        try{
            req.body.user = (jwt.verify(req.cookies.token, process.env.SECRET || "test" ) as any).user;
            return next();
        }catch(error){
            jetLogger.err(error);
        }
    }
    return signinRenderer(res);
};

const pages = express.Router();

pages.get("/", async(req, res) =>{
    return homepageRenderer(res);
});

pages.get("/docs", async(req, res) =>{
    return docsRenderer(res);
});

pages.get("/signin", async(req, res) =>{
    return signinRenderer(res);
});

pages.get("/dashboard", secureRoute, async(req, res) =>{
    return dashboardRenderer(res);
});

pages.get("/chats", secureRoute, async(req, res) =>{
    return chatRenderer(res);
});

export default pages;