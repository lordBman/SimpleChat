import ReactDOMServer from "react-dom/server";
import express, { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import jetLogger from "jet-logger";
import { Credential } from "@simplechat/shared";
import { Signin, Docs, Homepage, DashBoard } from "simplechat-pages";
import React from "react";


const signinRenderer = (res: Response) =>{
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

const errorRenderer = (res: Response) =>{
    const root = ReactDOMServer.renderToString(<Docs />);

    const html = `
        <html lang="en">
            <head>
                <title>Simple Chat | Error</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/css/icons.css" />
                <link rel="stylesheet" href="/assets/dist/error.css" />
            </head>
            <body>
                <main id="root">${root}</main>
                <script src="/assets/dist/error.js"></script>
            </body>
        </html>
    `;
    res.status(200).contentType("text/html").send(Buffer.from(html));
}


const secureRoute = async (req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.token){
        try{
            const credential = (jwt.verify(req.cookies.token, process.env.SECRET || "test" ) as any).credential as Credential;
            if(credential.role === "Admin" || credential.role === "Developer" ){
                return next();
            }
            return errorRenderer(res);
        }catch(error){
            jetLogger.err(error);
        }
    }
    return signinRenderer(res);
};

const pages = express.Router();

pages.get("/", async(req, res) =>{
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
});

pages.get("/docs", async(req, res) =>{
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
});

pages.get("/signin", async(req, res) =>{
    return signinRenderer(res);
});

pages.use("/dashboard", secureRoute, async(req, res) =>{
    const root = ReactDOMServer.renderToStaticMarkup(<DashBoard />);

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
});

export default pages;
