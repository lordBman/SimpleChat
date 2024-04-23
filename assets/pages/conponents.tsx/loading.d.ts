import React, { CSSProperties } from "react";
export interface CircleLoadingProps {
    size?: number | string;
    style?: CSSProperties;
    labelStyle?: CSSProperties;
    message: string;
}
declare const CircleLoading: React.FC<CircleLoadingProps>;
export default CircleLoading;
