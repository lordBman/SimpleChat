import React, { useContext, useMemo, useState } from "react";
import { useMutation } from "react-query";
import { ProjectKey, axiosInstance } from "../../utils";
import { Friend, User } from "@prisma/client";
import { FriendView, FriendResultView } from "../../conponents";
import { FriendsContext, FriendsContextType } from "../../providers/friends-provider";
import "../../css/chats/friends.scss";
import { AppContext, AppContextType } from "../../providers/app-provider";

const Friends = () =>{
    const { data } = useContext(AppContext) as AppContextType;
    const { friends } = useContext(FriendsContext) as FriendsContextType;
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ user: User, friend?: Friend }[]>([])

    const searchMutation = useMutation({
        mutationKey:  ["friends"],
        mutationFn: (variables: string)=> axiosInstance.get(`/friends/search?query=${variables}&key=${ProjectKey}`),
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

    const friendViews = useMemo(()=>{
        const sortedFriends = friends.sort((a, b)=>{
            const aName = a.acceptorID === data?.id ? a.requester.name : a.acceptor.name;
            const bName = b.acceptorID === data?.id ? b.requester.name : b.acceptor.name;

            return aName.localeCompare(bName);
        });

        const init = [];
        let [letter, index] = [ "", 0 ];
        while(index < sortedFriends.length){
            const friend = sortedFriends[index];
            const name = friend.acceptorID === data?.id ? friend.requester.name : friend.acceptor.name;
            if(name.charAt(0).toUpperCase() === letter){
                init.push(<FriendView friend={friend} key={index} />);
                index += 1;
            }else{
                letter = name.charAt(0).toUpperCase();
                init.push(
                    <div style={{ marginTop: 10, color: "gray" }} key={`${index}-init`}>
                        <h2>{letter}</h2>
                    </div>
                );
            }
        }
        return init;
    }, [friends]);

    return (
        <div className="chats-main-container">
            <div className="section-title">
                <h2 className="chats-title">Friends</h2>
            </div>
            <form id="friend-search-form" onSubmit={onSearch} className="search-form">
                <span className="formkit--search"></span>
                <input id="search-users-input" value={query} onChange={onQueryChange} className="search-input" type="search" placeholder="search users ..." />
            </form>
            { query.length <= 0 && <div id="friends-list">{ friendViews }</div> }
            { searchMutation.isLoading && <div id="friends-search-loading">
                <span>Loading...</span>
            </div> }
            { query.length > 0 && <div id="friends-search-results">{results.map((result, index)=> <FriendResultView result={result} key={index}/>)}</div> }
        </div>
    );
}

export default Friends;