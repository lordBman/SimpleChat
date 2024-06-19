import React, { useContext, useState } from "react";
import { CircleLoading } from ".";
import { Friend, User } from "@prisma/client";
import { AppContext, AppContextType } from "../providers/app-provider";
import { FriendsContext, FriendsContextType } from "../providers/friends-provider";
import { ChatContext, ChatContextType } from "../providers/chats-provider";
import { useMutation } from "react-query";
import { ProjectKey, axiosInstance } from "../utils";
import { FriendResponse } from "../responses";

interface FriendResultViewProps{
    result: { user: User, friend?: Friend }
}

const FriendResultView: React.FC<FriendResultViewProps> = ({ result }) =>{
    const { data} = useContext(AppContext) as AppContextType;
    const { refreshFriends } = useContext(FriendsContext) as FriendsContextType;
    const { makeCurrent } = useContext(ChatContext) as ChatContextType;

    const [ state, setState ] = useState(result);

    const requestMutation = useMutation({
        mutationKey : ["friend_request"],
        mutationFn: () => axiosInstance.post(`/friends`, { userID: state.user.id,  key: ProjectKey }),
        onSuccess: (data) => {
            refreshFriends();
            setState(init => { return {...init, friend: data.data } });
        },
        onError: (error) => alert(error),
    });
    const sendRequest = () => requestMutation.mutate();

    const acceptMutation = useMutation({
        mutationKey: ["accept_request"],
        mutationFn: () => axiosInstance.post(`/friends/accept`, { id: state.friend?.id, key: ProjectKey }),
        onSuccess: (data) =>{
            refreshFriends();
            setState(init => { return {...init, friend: data.data } });
        },
        onError: (error) => alert(error),
    });
    const acceptRequest = () => acceptMutation.mutate();
    
    const cancelMutation = useMutation({
        mutationKey: ["cancel_request"],
        mutationFn: () => axiosInstance.post(`/friends/cancel`, { id: state.friend?.id, key: ProjectKey }),
        onSuccess: (data) => {
            refreshFriends();
            setState(init => { return {...init, friend: undefined } });
        },
        onError: (error) => alert(error),
    });
    const cancelRequest = () =>cancelMutation.mutate();

    let accepted = state.friend && state.friend.accepted;

    let loading = requestMutation.isLoading || acceptMutation.isLoading || cancelMutation.isLoading;
    let requesting = !accepted && state.friend && state.friend.acceptorID === data?.id;
    let requested = !accepted && state.friend && state.friend.requesterID === data?.id;

    const message = () => accepted && makeCurrent(state.friend);

    return (
        <div onClick={message} className="friends-search-result-item-container">
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{result.user.name.charAt(0).toUpperCase()}</div>
            </div>
            <div className="friends-search-result-item-details">
                <div className="friends-search-result-item-name">{result.user.name}</div>
                <div className="friends-search-result-item-email">{result.user.email}</div>
                { !loading && <div style={{ alignSelf: 'end', gap: 10, display: "flex"  }}>
                    { requesting  && !accepted && <button onClick={acceptRequest} className="friends-search-result-item-button">Accept</button> }
                    { requested && <button onClick={cancelRequest} className="friends-search-result-item-button">Cancel</button> }
                    { !requesting && !requested && <button onClick={sendRequest} className="friends-search-result-item-button">Request</button> }
                    { requesting && <button className='friends-search-result-item-button' style={{ marginLeft: 10 }} onClick={cancelRequest} >Decline</button> }
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
    friend: FriendResponse,
} 

const FriendView: React.FC<FriendViewProps> = ({ friend }) =>{
    const { data} = useContext(AppContext) as AppContextType;
    const { cancel, accept } = useContext(FriendsContext) as FriendsContextType;
    const { makeCurrent } = useContext(ChatContext) as ChatContextType;

    const acceptRequest = () => accept(friend.id);
    const cancelRequest = () => cancel(friend.id);

    let loading = false;
    let requesting = !friend.accepted && friend.acceptorID === data?.id;
    let requested = !friend.accepted && friend.requesterID === data?.id;

    const init = (friend.requesterID === data?.id ? friend.acceptor : friend.requester)!;

    const message = () => friend.accepted && makeCurrent(friend);

    return (
        <div className="friends-search-result-item-container" onClick={message}>
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{init.name.charAt(0).toUpperCase()}</div>
            </div>
            <div className="friends-search-result-item-details">
                <div className="friends-search-result-item-name">{init.name}</div>
                <div className="friends-search-result-item-email">{init.email}</div>
                { !loading && <div style={{ alignSelf: 'end', gap: 10, display: "flex" }}>
                    { requesting  && <button onClick={acceptRequest} className="friends-search-result-item-button">Accept</button> }
                    { requested && <button onClick={cancelRequest} className="friends-search-result-item-button">Cancel</button> }
                    { requesting && <button className='friends-search-result-item-button'>Decline</button> }
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