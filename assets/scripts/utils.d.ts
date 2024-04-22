import React from "react";
declare const findElement: (id: string) => HTMLElement;
declare const axiosInstance: import("axios").AxiosInstance;
declare const formatTime: (date: Date) => string;
declare const getCookie: (cname: string) => string;
declare class ReactUtils {
    static append: (element: Element, node: React.ReactNode) => void;
    static replace: (element: Element, node: React.ReactNode) => void;
}
export { findElement, axiosInstance, formatTime, ReactUtils, getCookie };
