import React, { useContext, useState } from "react";
import { CircleLoading } from ".";
import { axiosInstance } from "../utils";
import { Friend, User } from "@prisma/client";
import { AppContext, AppContextType } from "../dashboard/providers";
import { useMutation } from "react-query";

interface FriendResultViewProps{
    result: { user: User, friend?: Friend }
}

const FriendResultView: React.FC<FriendResultViewProps> = ({ result }) =>{
    const { user, refreshFriends } = useContext(AppContext) as AppContextType;
    const [ state, setState ] = useState(result);

    const requestMutation = useMutation({
        mutationKey : ["friend_request"],
        mutationFn: () => axiosInstance.post(`/friends`, { userID: state.user.id }),
        onSuccess: (data) => {
            refreshFriends();
            setState(init => { return {...init, friend: data.data } });
        },
        onError: (error) => alert(error),
    });
    const sendRequest = () => requestMutation.mutate();

    const acceptMutation = useMutation({
        mutationKey: ["accept_request"],
        mutationFn: () => axiosInstance.post(`/friends/accept`, { id: state.friend?.id }),
        onSuccess: (data) =>{
            refreshFriends();
            setState(init => { return {...init, friend: data.data } });
        },
        onError: (error) => alert(error),
    });
    const acceptRequest = () => acceptMutation.mutate();
    
    const cancelMutation = useMutation({
        mutationKey: ["cancel_request"],
        mutationFn: () => axiosInstance.post(`/friends/cancel`, { id: state.friend?.id }),
        onSuccess: (data) => {
            refreshFriends();
            setState(init => { return {...init, friend: undefined } });
        },
        onError: (error) => alert(error),
    });
    const cancelRequest = () =>cancelMutation.mutate();

    let loading = requestMutation.isLoading || acceptMutation.isLoading || cancelMutation.isLoading;
    let accepted = state.friend && state.friend.accepted;
    let requesting = !accepted && state.friend && state.friend.acceptorID === user?.id;
    let requested = !accepted && state.friend && state.friend.requesterID === user?.id;

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
                    { requesting && <button className='friends-search-result-item-button' onClick={cancelRequest} >Decline</button> }
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

interface FriendViewProps{
    friend: Friend & { acceptor?: User, requester?: User },
} 

const FriendView: React.FC<FriendViewProps> = ({ friend }) =>{
    const { user, refreshFriends } = useContext(AppContext) as AppContextType;

    const acceptMutation = useMutation({
        mutationKey: ["accept_request"],
        mutationFn: () => axiosInstance.post(`/friends/accept`, { id: friend.id }),
        onSuccess: (data) =>refreshFriends(),
        onError: (error) => alert(error),
    });
    const acceptRequest = () => acceptMutation.mutate();
    
    const cancelMutation = useMutation({
        mutationKey: ["cancel_request"],
        mutationFn: () => axiosInstance.post(`/friends/cancel`, { id: friend.id }),
        onSuccess: (data) =>  refreshFriends(),
        onError: (error) => alert(error),
    });
    const cancelRequest = () =>cancelMutation.mutate();

    let loading = acceptMutation.isLoading || cancelMutation.isLoading;
    let requesting = !friend.accepted && friend.acceptorID === user?.id;
    let requested = !friend.accepted && friend.requesterID === user?.id;

    const init = (friend.requesterID === user?.id ? friend.acceptor : friend.requester)!;

    return (
        <div className="friends-search-result-item-container">
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{init.name.charAt(0).toUpperCase()}</div>
            </div>
            <div className="friends-search-result-item-details">
                <div className="friends-search-result-item-name">{init.name}</div>
                <div className="friends-search-result-item-email">{init.email}</div>
                { !loading && <div style={{ alignSelf: 'end'}}>
                    { requesting  && <button onClick={acceptRequest} className="friends-search-result-item-button">Accept</button> }
                    { requested && <button onClick={cancelRequest} className="friends-search-result-item-button">Cancel</button> }
                    { requesting && <button className='friends-search-result-item-button'>Decline</button> }
                    { friend.accepted && <button className='friends-search-result-item-button'>Message</button> }
                </div> }
                { loading && <div style={{ alignSelf: 'end'}}>
                        <CircleLoading message="requesting" labelStyle={{ fontSize: 12, color: "grey", fontWeight: 300, letterSpacing: 1.5 }} />
                    </div>
                }
            </div>
        </div>
    );
}

export { FriendView, FriendResultView }