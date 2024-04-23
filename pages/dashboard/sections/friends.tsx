import React, { useContext, useState } from "react";
import { useMutation } from "react-query";
import { axiosInstance } from "../../utils";
import { Friend, User } from "@prisma/client";
import { FriendView, FriendResultView } from "../../conponents.tsx";
import { AppContext, AppContextType } from "../providers";

const Friends = () =>{
    const { friendsState } = useContext(AppContext) as AppContextType;
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ user: User, friend?: Friend }[]>([])

    const searchMutation = useMutation({
        mutationKey:  ["friends"],
        mutationFn: (variables: string)=> axiosInstance.get(`/friends/search?query=${variables}`),
        onSuccess: (data) =>{
            setResults(data.data);
        },
        onError: (error) =>alert(error)
    });

    const onSearch = (event: React.FormEvent<HTMLFormElement>) =>{
        event.preventDefault();
        if(query.length > 0 && !searchMutation.isLoading){
            searchMutation.mutate(query)
        }
    }

    const onQueryChange = (event: React.ChangeEvent<HTMLInputElement>) =>{
        setQuery(event.currentTarget.value);
    }

    return (
        <div className="chats-main-container">
            <div>
                <h2 className="chats-title">Friends</h2>
            </div>
            <form id="friend-search-form" onSubmit={onSearch} className="search-form">
                <span className="formkit--search"></span>
                <input id="search-users-input" value={query} onChange={onQueryChange} className="search-input" type="search" placeholder="search users ..." />
            </form>
            { query.length <= 0 && <div id="friends-list">
                { friendsState.friends.map((friend, index) => <FriendView friend={friend} key={index} />) }
            </div> }
            { searchMutation.isLoading && <div id="friends-search-loading">
                <span>Loading...</span>
            </div> }
            { query.length > 0 && <div id="friends-search-results">{results.map((result, index)=> <FriendResultView result={result} key={index}/>)}</div> }
        </div>
    );
}

export default Friends;