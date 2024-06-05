import React, { CSSProperties } from "react";

export interface CircleLoadingProps{
    size?: number | string,
    style?: CSSProperties,
    labelStyle?: CSSProperties,
    message: string
}

const CircleLoading: React.FC<CircleLoadingProps> = (props: CircleLoadingProps) =>{
    const size = props.size || "26px";
    return (
        <div style={{ display: "flex", alignItems:"center", gap: 6 }}>
            <div className="circle-loading" style={{ ...props, height: size, width: size }}>
                <div className="circle-loading-inner" />
            </div>
            <label style={{ fontSize: "14px", ...props.labelStyle }}>{ props.message }</label>
        </div>
    );
}

export const Loading = () =>{
    return (
        <div style={{ display:"flex", width: "100dvw", height: "100dvh", backgroundColor: "white", alignItems: "center", justifyContent: "center" }}>
            <PuffLoader color="#36d7b7" />
        </div>
    );
}


export default CircleLoading;
