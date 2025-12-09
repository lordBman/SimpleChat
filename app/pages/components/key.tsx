import React, { useMemo, useState } from "react";
import { copyToClipboard } from "../utils";

interface KeyProps{
    title: string;
    secret: string;
}

const Key: React.FC<KeyProps> = ({ title, secret }) =>{
    const [hide, setHide] = useState(true);

    const initSecret = useMemo(()=>{
        if(hide){
            let index = 4;
            let init = secret.substring(0, index);
            while(index < secret.length - 4){
                if(secret.charAt(index) === "-"){
                    init += "-";
                }else{
                    init += "*";
                }
                index += 1;
            }
            return init + secret.substring(index);
        }
        return secret;
    }, [hide]);

    const toggle = () => setHide((init) => {
        return !init;
    });
    const copy = () => copyToClipboard(secret);

    return (
        <div>
            <label style={{ display: "block", fontSize: 12, color: "#555" }}>{title}</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                <code style={{ padding: "6px 8px", background: "#f6f6f6", borderRadius: 4 }}>{initSecret}</code>
                <span onClick={toggle} style={{ cursor: "pointer" }}>
                    { hide && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M3.275 15.296C2.425 14.192 2 13.639 2 12c0-1.64.425-2.191 1.275-3.296C4.972 6.5 7.818 4 12 4s7.028 2.5 8.725 4.704C21.575 9.81 22 10.361 22 12c0 1.64-.425 2.191-1.275 3.296C19.028 17.5 16.182 20 12 20s-7.028-2.5-8.725-4.704Z" opacity="0.5"/>
                                <path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0Z"/>
                            </g>
                        </svg>
                    )}
                    { !hide && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                            <path fill="currentColor" fill-rule="evenodd" d="M2.919 6.605a1 1 0 0 0-1.838.79l.002.003l.003.007l.01.021l.032.072q.04.09.12.25c.105.21.262.506.47.857c.41.687 1.027 1.6 1.872 2.52l-.797.797a1 1 0 1 0 1.414 1.414l.84-.84c.565.455 1.197.885 1.897 1.256l-.782 1.202a1 1 0 0 0 1.676 1.091l.985-1.514c.677.208 1.402.355 2.177.425V16.5a1 1 0 0 0 1 1V13c-2.748 0-4.819-1.199-6.304-2.59l-.024-.022a12 12 0 0 1-.564-.569a13.4 13.4 0 0 1-1.67-2.237a12 12 0 0 1-.516-.968zm-1.838.79L2 7c-.92.394-.919.395-.919.395" clip-rule="evenodd"/>
                            <path fill="currentColor" d="M15.22 12.398A8.7 8.7 0 0 1 12 13v4.5a1 1 0 0 0 1-1v-1.544c.772-.07 1.497-.217 2.176-.425l.986 1.515a1 1 0 0 0 1.676-1.091l-.782-1.203c.701-.37 1.332-.8 1.897-1.256l.84.84a1 1 0 1 0 1.414-1.414l-.797-.798a15.4 15.4 0 0 0 2.302-3.296a10 10 0 0 0 .19-.395l.011-.026l.004-.008l.002-.005a1 1 0 1 0-1.838-.788l-.005.011a5 5 0 0 1-.146.302a13 13 0 0 1-2.614 3.48c-.841.79-1.87 1.517-3.095 2" opacity="0.5"/>
                        </svg>
                    ) }
                </span>
                <span onClick={copy} style={{ cursor: "pointer" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"/>
                            <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" opacity="0.5"/>
                        </g>
                    </svg>
                </span>
            </div>
        </div>
    );
}

export default Key;