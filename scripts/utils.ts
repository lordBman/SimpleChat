import axios from "axios";
import { env } from "process";
import React from "react";
import ReactDOMClient from "react-dom/client";
import ReactDOMServer from "react-dom/server";

const findElement = (id: string) =>{
    const element = document.getElementById(id);
    if(element){
        return element;
    }
    throw new Error(`element with name: ${id} not found`);
}

const axiosInstance =  axios.create({
	headers: { 
		'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true',
		'Content-Type': 'application/x-www-form-urlencoded' 
	},
	withCredentials: true, 
	baseURL: env.URL, });

const formatTime = (date: Date) =>{
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${ hours > 12 ? (hours % 12) : hours }:${minutes}${(hours / 12) === 0 ? "am" : "pm" }`;
}

const getCookie = (cname: string) =>{
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

class ReactUtils{
    public static append = (element: Element, node: React.ReactNode) =>{
        element.innerHTML += ReactDOMServer.renderToString(node);
        let init = element.lastElementChild!;
            
        this.replace(init, node);
    }

    public static replace = (element: Element, node: React.ReactNode) =>{
        ReactDOMClient.createRoot(element).render(node);
    }
}

export { findElement, axiosInstance, formatTime,  ReactUtils, getCookie }