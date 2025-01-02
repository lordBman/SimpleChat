import axios from "axios";

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

export class TypingManager{
    timer?: NodeJS.Timeout;
    callback: CallableFunction;
    isRunning: boolean
    intervals: number;

    constructor(intervals: number, callback: CallableFunction){
        this.callback = callback;
        this.isRunning = false;
        this.intervals = intervals;
    }

    public run = () =>{
        if(!this.isRunning){
            this.isRunning = true;
            this.callback();
            this.timer = setTimeout(()=>{
                this.isRunning = false;
            }, this.intervals);
        }
    }

    public restart = () =>{
        clearTimeout(this.timer);
        this.isRunning = true;
        this.callback();
        this.timer = setTimeout(()=>{
            this.isRunning = false;
        }, this.intervals);
    }

    public stop = () => {
        this.isRunning = false;
        clearTimeout(this.timer);
    }
}