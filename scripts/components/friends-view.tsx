import React, { useState } from "react";
import { CircleLoading } from ".";
import { axiosInstance } from "../utils";
import { Friend, User } from "@prisma/client";

interface FriendsViewProps{
    result: { user: User, friend?: Friend }
}

const FriendsView: React.FC<FriendsViewProps> = ({ result }) =>{
    const [loading, setLoading] = useState(false);
    const [ state, setState ] = useState(result);

    const sendRequest = () =>{
        setLoading(true);
        axiosInstance.post(`/friends/request`, { userID: state.user.id }).then((data)=>{
            setState(init => { return {...init, friend: data.data } });
        }).catch((error)=>{
            alert(error);
        }).finally(()=> setLoading(false));
    }
    
    const acceptRequest = () =>{
        setLoading(true);
        axiosInstance.post(`/friends`, { id: state.friend?.id }).then((data)=>{
            setState(init => { return {...init, friend: data.data } });
        }).catch((error)=>{
            alert(error);
        }).finally(()=> setLoading(false));
    }
    
    const cancelRequest = () =>{
        setLoading(true);
        axiosInstance.post(`/friends/cancel`, { id: state.friend?.id }).then((data)=>{
            setState(init => { return {...init, friend: undefined } });
        }).catch((error)=>{
            alert(error);
        }).finally(()=> setLoading(false));
    }

    const accepted = state.friend && state.friend.accepted;
    const requesting = !accepted && state.friend && state.friend.acceptorID === "myid";
    const requested = !accepted && state.friend && state.friend.requesterID === "myId";

    return (
        <div className="friends-search-result-item-container">
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{result.user.name.charAt(0).toUpperCase()}</div>
            </div>
            <div className="friends-search-result-item-details">
                <div className="friends-search-result-item-name">{result.user.name}</div>
                <div className="friends-search-result-item-email">{result.user.email}</div>
                { !loading && <div style={{ alignSelf: 'end'}}>
                    { state.friend  && state.friend. && <button onClick={acceptRequest} className="friends-search-result-item-button">Accept</button> }
                    { result.requested && <button onClick={cancelRequest} className="friends-search-result-item-button">Cancel</button> }
                    { !result.requesting && !result.requested && <button onClick={sendRequest} className="friends-search-result-item-button">Request</button> }
                    { result.requesting && <button className='friends-search-result-item-button'>Decline</button> }
                </div> }
                { loading && <div style={{ alignSelf: 'end'}}>
                        <CircleLoading message="requesting" labelStyle={{ fontSize: 12, color: "grey", fontWeight: 300, letterSpacing: 1.5 }} />
                    </div>
                }
            </div>
        </div>
    );
}

export default FriendsView;