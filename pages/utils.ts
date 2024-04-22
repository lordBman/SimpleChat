import axios from "axios";

export const axiosInstance =  axios.create({
	headers: { 
		'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true',
		'Content-Type': 'application/x-www-form-urlencoded' 
	},
	withCredentials: true, 
	baseURL: "http://localhost:5000", });

export const formatTime = (date: Date) =>{
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${ hours > 12 ? (hours % 12) : hours }:${minutes}${(hours / 12) === 0 ? "am" : "pm" }`;
}