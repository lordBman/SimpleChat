import React, { useContext, useState } from "react";
import { CircleLoading } from ".";
import { axiosInstance } from "../utils";
import { Friend, User } from "@prisma/client";
import { AppContext, AppContextType } from "../dashboard/providers";
import { useMutation } from "react-query";

interface FriendsViewProps{
    result: { user: User, friend?: Friend }
}

const FriendsView: React.FC<FriendsViewProps> = ({ result }) =>{
    const { data } = useContext(AppContext) as AppContextType;
    const [ state, setState ] = useState(result);

    const requestMutation = useMutation({
        mutationKey : ["friend_request"],
        mutationFn: () => axiosInstance.post(`/friends/request`, { userID: state.user.id }),
        onSuccess: (data) => {
            setState(init => { return {...init, friend: data.data } });
        },
        onError: (error) => alert(error),
    });
    const sendRequest = () => requestMutation.mutate();

    const acceptMutation = useMutation({
        mutationKey: ["accept_request"],
        mutationFn: () => axiosInstance.post(`/friends`, { id: state.friend?.id }),
        onSuccess: (data) =>{
            setState(init => { return {...init, friend: data.data } });
        },
        onError: (error) => alert(error),
    });
    const acceptRequest = () => acceptMutation.mutate();
    
    const cancelMutation = useMutation({
        mutationKey: ["cancel_request"],
        mutationFn: () => axiosInstance.post(`/friends/cancel`, { id: state.friend?.id }),
        onSuccess: (data) =>  setState(init => { return {...init, friend: undefined } }),
        onError: (error) => alert(error),
    });
    const cancelRequest = () =>cancelMutation.mutate();

    const loading = requestMutation.isLoading || acceptMutation.isLoading || cancelMutation.isLoading;
    const accepted = state.friend && state.friend.accepted;
    const requesting = !accepted && state.friend && state.friend.acceptorID === data.id;
    const requested = !accepted && state.friend && state.friend.requesterID === data.id;

    return (
        <div className="friends-search-result-item-container">
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{result.user.name.charAt(0).toUpperCase()}</div>
            </div>
            <div className="friends-search-result-item-details">
                <div className="friends-search-result-item-name">{result.user.name}</div>
                <div className="friends-search-result-item-email">{result.user.email}</div>
                { !loading && <div style={{ alignSelf: 'end'}}>
                    { requesting  && !accepted && <button onClick={acceptRequest} className="friends-search-result-item-button">Accept</button> }
                    { requested && <button onClick={cancelRequest} className="friends-search-result-item-button">Cancel</button> }
                    { !requesting && !requested && <button onClick={sendRequest} className="friends-search-result-item-button">Request</button> }
                    { requesting && <button className='friends-search-result-item-button'>Decline</button> }
                    { accepted && <button className='friends-search-result-item-button'>Message</button> }
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