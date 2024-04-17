import axios from "axios";

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
	baseURL: "http://localhost:5000", });

export { findElement, axiosInstance }