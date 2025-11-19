import React, { useContext, useState } from "react";
import { CircleLoading } from ".";
import { Details, Friend } from "@simplechat/shared/models";
import { AppContext, AppContextType } from "../providers/app-provider";
import { useFriendsContext } from "simplechat_provider/src/contexts";
import { useCallbackRequest } from "simplechat_provider/src/request";
import { apiClientInstance } from "../utils";

interface FriendResultViewProps{
    result: { user: Details, friend?: Friend }
}

const FriendResultView: React.FC<FriendResultViewProps> = ({ result }) =>{
    const {user, makeCurrent } = useContext(AppContext) as AppContextType;
    const { refreshFriends } = useFriendsContext();

    const [ state, setState ] = useState(result);

    const requestMutation = useCallbackRequest<Friend, void>({
        request: () => apiClientInstance.post(`/friends`,{ data:  { userID: state.user.id } }),
        onDone: (data) => {
            refreshFriends();
            setState(init => { return {...init, friend: data } });
        },
        onFail: (error) => alert(error),
    });
    const sendRequest = () => requestMutation.start();

    const acceptMutation = useCallbackRequest<Friend, void>({
        request: () => apiClientInstance.post(`/friends/accept`,{ data:  { id: state.friend?.id } }),
        onDone: (data) =>{
            refreshFriends();
            setState(init => { return {...init, friend: data } });
        },
        onFail: (error) => alert(error),
    });
    const acceptRequest = () => acceptMutation.start();
    
    const cancelMutation = useCallbackRequest<Friend, void>({
        request: () => apiClientInstance.post(`/friends/cancel`, { data: { id: state.friend?.id } }),
        onDone: (data) => {
            refreshFriends();
            setState(init => { return {...init, friend: undefined } });
        },
        onFail: (error) => alert(error),
    });
    const cancelRequest = () =>cancelMutation.start();

    let accepted = state.friend && state.friend.accepted;

    let loading = requestMutation.loading || acceptMutation.loading || cancelMutation.loading;
    let requesting = !accepted && state.friend && state.friend.acceptor.id === user?.id;
    let requested = !accepted && state.friend && state.friend.requester.id === user?.id;

    const message = () => {
        if(accepted && state.friend){
            makeCurrent(state.friend)
        }
    }

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
    friend: Friend
} 

const FriendView: React.FC<FriendViewProps> = ({ friend }) =>{
    const { user, makeCurrent} = useContext(AppContext) as AppContextType;
    const { cancel, accept } = useFriendsContext();

    const acceptRequest = () => accept(friend.id);
    const cancelRequest = () => cancel(friend.id);

    let loading = false;
    let requesting = !friend.accepted && friend.acceptor.id === user?.id;
    let requested = !friend.accepted && friend.requester.id === user?.id;

    const init = (friend.requester.id === user?.id ? friend.acceptor : friend.requester)!;

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