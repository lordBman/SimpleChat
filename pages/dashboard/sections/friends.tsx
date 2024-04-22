import React, { useState } from "react";
import { useMutation } from "react-query";
import { axiosInstance } from "../../utils";
import { Friend, User } from "@prisma/client";

const Friends = () =>{
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ user: User, friend?: Friend }[]>([])

    const searchMutation = useMutation({
        mutationKey:  ["friends"],
        mutationFn: (variables: string)=> axiosInstance.get(`/friends/search?query=${variables}`),
        onSuccess: (data) =>{
            setResults(data.data);
        },
        onError: (error) =>{

        }
    });

    const onSearch = (event: React.FormEvent<HTMLFormElement>) =>{
        event.preventDefault();

        if(query.length > 0 && !searchMutation.isLoading){
            searchMutation.mutate(query)
        }
    }

    return (
        <div className="chats-main-container">
            <div>
                <h2 className="chats-title">Friends</h2>
            </div>
            <form id="friend-search-form" onSubmit={onSearch} className="search-form">
                <span className="formkit--search"></span>
                <input id="search-users-input" className="search-input" type="search" placeholder="search users ..." />
            </form>
            { query.length <= 0 && <div id="friends-list"></div> }
            { searchMutation.isLoading && <div id="friends-search-loading" style={{ display: "none" }}>
                <span>Loading...</span>
            </div> }
            <div id="friends-search-results" style={{ display: "none" }}></div>
        </div>
    );
}

export default Friends;