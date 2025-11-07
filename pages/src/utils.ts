import { Friend, Member, Credential } from "@simplechat/shared/models";
import axios from "axios";

export const AccessKey = "a02c3f9f81c969467e99509a8edc940f4941";

export interface LooseObject {
    [key: string]: any
}

export const axiosInstance =  axios.create({
	headers: { 
		'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true',
		'Content-Type': 'application/x-www-form-urlencoded' 
	},
	withCredentials: true,
	baseURL: "/api" });

export const getName = ( user: Credential, response : Friend | Member):string =>{
    if((response as any).group){
        const init = response as Member;

        return init.group.name;
    }else{
        const init = response as Friend;

        return init.acceptor.id === user.id ? init.acceptor.name : init.requester.name;
    }
}

export const formatMonth = (date: Date)=>{
    switch(date.getMonth()){
        case 1:
            return "January";
        case 2:
            return "Frebruary";
        case 3:
            return "March";
        case 4:
            return "April";
        case 5:
            return "May";
        case 6:
            return "June";
        case 7:
            return "July";
        case 8:
            return "August";
        case 9:
            return "September";
        case 10:
            return "Octomber";
        case 11:
            return "November";
        case 12:
            return "December";
    }
    return "";
}

export const formatDay = (date: Date) =>{
    const day = date.getDay();
    if(day % 10 === 1 && day !== 11){
        return `${day}st`;
    }else if(day % 10 === 2 && day !== 12){
        return `${day}nd`;
    }else if(day % 10 === 3 && day !== 13){
        return `${day}rd`;
    }
    return `${day}th`;
}

export const formatTime = (date: Date) =>{
    const now = new Date();

    const hours = date.getHours();
    const minutes = date.getMinutes();

    const time = `${ hours > 12 ? (hours % 12) : hours }:${minutes}${(hours / 12) === 0 ? "am" : "pm" }`;

    if(date.getFullYear() === now.getFullYear()){
        if(now.getMonth() - date.getMonth() === 1){
            return `${time} ${formatDay(date)} last Month`;
        }else if(now.getMonth() - date.getMonth() > 1){
            return `${time} ${formatDay(date)} ${formatMonth(date)}`; 
        }else{
            if((now.getDay() - date.getDay()) === 1){
                return `${time} Yesterday`;
            }else if(now.getDay() - date.getDay() > 1){
                return `${time} ${now.getDay() - date.getDay()} days ago`;
            }else{
                return `${time}`;
            }
        }   
    }
    return `${time} ${formatDay(date)} ${date.getMonth()} ${date.getFullYear()}`
}

export const getCookie = (cname: string) =>{
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

export const extract = (form: HTMLFormElement): LooseObject =>{
    const formData = new FormData(form);

    // Create an empty object to store the key-value pairs
    let obj: LooseObject = {};

    // Loop through the entries of the FormData object
    formData.forEach((value, key) => {
        // Assign each value to the corresponding key in the object
        obj[key] = value.toString();
    });

    return obj;
}
