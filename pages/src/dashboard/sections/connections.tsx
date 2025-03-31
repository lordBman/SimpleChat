import React, { useContext, useMemo, useState } from "react";
import { MemberResultView, MemberView } from "../../conponents/members-view";
import { useMutation } from "react-query";
import { ProjectKey, axiosInstance, getName } from "../../utils";
import { FriendResultView, FriendView } from "../../conponents";
import { AppContext, AppContextType } from "../../providers/app-provider";

import "../../css/chats/friends.scss";
import { FriendsContext, MembersContext } from "simplechat_provider/src/contexts";
import { FriendsContextType, MembersContextType } from "simplechat_provider/src/models";
import { Friend, Group, Member, Credential } from "@simplechat/shared";

enum Filter{
    all, friends, groups
}

const Connections = () =>{
    const { user } = useContext(AppContext) as AppContextType;
    const { members } = useContext(MembersContext) as MembersContextType;
    const { friends } = useContext(FriendsContext) as FriendsContextType;
    
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Array<{ user: Credential, friend?: Friend } | { group: Group, member?: Member }>>([]);
    const [createState, setCreateState] = useState({ isOpen: false, name: "" });
    const [filter, setFilter] = useState<Filter>(Filter.all);
    
    const searchMutation = useMutation({
        mutationKey:  ["connections"],
        mutationFn: (variables: string)=> axiosInstance.get(`/search?query=${variables}&key=${ProjectKey}`),
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

    const createMutation = useMutation({
        mutationKey:  ["connections"],
        mutationFn: (name: string)=> axiosInstance.post(`/groups/create`, { name, key: ProjectKey }),
        onSuccess: (data) =>{
            setResults(data.data);
            close();
        },
        onError: (error) =>alert(error)
    });

    const onCreate = (event: React.FormEvent<HTMLFormElement>) =>{
        event.preventDefault();
        if(createState.name.length > 0 && !createMutation.isLoading){
            createMutation.mutate(createState.name);
        }
    }

    const onQueryChange = (event: React.ChangeEvent<HTMLInputElement>) =>{
        setQuery(event.currentTarget.value);
    }

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) =>{
        setCreateState(init => ({...init, name: event.target.value }));
    }

    const open = () => setCreateState(init => ({...init, isOpen: true }));
    const close = () => setCreateState(init => ({...init, isOpen: false, name: ""}));

    const views = useMemo(()=>{
        let responses: Array<Friend | Member> = [];
        switch(filter){
            case Filter.all:
                responses = [...members, ...friends];
                break;
            case Filter.friends:
                responses = friends;
                break;
            case Filter.groups:
                responses = members;
                break;
        }

        const sorted = responses.sort((a, b)=>{
            const aName = getName(user!, a);
            const bName = getName(user!, b);

            return aName.localeCompare(bName);
        });

        const init = [];
        let [letter, index] = [ "", 0 ];
        while(index < sorted.length){
            const item = sorted[index];
            const name = getName(user!, item);
            if(name.charAt(0).toUpperCase() === letter){
                if((item as any).group){
                    const member = item as Member;
                    init.push(<MemberView member={member} key={index} />);
                }else{
                    const friend = item as Friend;
                    init.push(<FriendView friend={friend} key={index} />);
                }
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
    }, [members, friends, filter]);

    return (
        <div className="chats-main-container">
            <div className="section-title">
                <h2 className="chats-title">Connections</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: 8 }}>
                <form className="search-form" style={{ flex: 1 }} onSubmit={onSearch}>
                    <span className="formkit--search"></span>
                    <input id="search-groups" onChange={onQueryChange} className="search-input" type="search" placeholder="search friends and groups ..." />
                </form>
                <button onClick={open} style={{ border: "none", backgroundColor: "grey", color: "white", borderRadius: 5, height: "100%", aspectRatio: 1, fontSize: 26 }}>
                    <span className="fluent--channel-add-24-regular"></span>
                </button>
            </div>
            { createState.isOpen && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", padding: 10, backgroundColor: "white", borderRadius: 8, width: "100%", gap: 8 }}>
                    <span className="mdi--cancel-circle" style={{ fontSize: 24, color: "grey" }} onClick={close}></span>
                    <form style={{ display: "flex", flexDirection: "row", width: "100%", gap: 8 }} onSubmit={onCreate}>
                        <input id="search-groups"  style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 2 }} onChange={onNameChange} className="group-create-input" placeholder="choose name" />
                        <button type="submit" style={{ border: "none", backgroundColor: "grey", color: "white", borderRadius: 8, height: "100%", fontSize: 20, fontWeight: 300, padding: 8, aspectRatio: 1 }}>+</button>
                    </form>
                </div>
            ) }
            { query.length <= 0 && (
                <div style={{ display: "flex", width: "100%", justifyContent: "flex-end", alignItems: "end" }}>
                    <div style={{ display: "flex", justifyContent: "stretch", borderRadius: 5, overflow: "clip", border: "solid grey 2px" }}>
                        <button onClick={ () => setFilter(Filter.all)} style={{ width: 60, padding: 8, fontSize: 12, fontFamily: "sans-serif", fontWeight: 300, borderStyle: "none", background: filter === Filter.all ? "grey" : "transparent", color: filter === Filter.all ? "white" : undefined  }}>All</button>
                        <button onClick={ () => setFilter(Filter.friends)} style={{ width: 60, padding: 8, fontSize: 12, fontFamily: "sans-serif", fontWeight: 300, borderStyle: "none", background: filter === Filter.friends ? "grey" : "transparent", color: filter === Filter.friends ? "white" : undefined  }}>Friends</button>
                        <button onClick={ () => setFilter(Filter.groups)} style={{ width: 60, padding: 8, fontSize: 12, fontFamily: "sans-serif", fontWeight: 300, borderStyle: "none", background: filter === Filter.groups ? "grey" : "transparent", color: filter === Filter.groups ? "white" : undefined  }}>Groups</button>
                    </div>
                </div>
            ) }
            { query.length <= 0 && filter === Filter.friends && <div id="friends-list">{ views }</div> }
            { searchMutation.isLoading && <div id="friends-search-loading">
                <span>Loading...</span>
            </div> }
            { query.length > 0 && <div id="friends-search-results">{results.map((result, index)=> {
                if("user" in result){
                    return <FriendResultView result={{ user: result.user, friend: result.friend }} key={index}/>
                }else{
                    return <MemberResultView member={result.member} group={result.group} key={index}/>
                }
            })}</div> }
        </div>
    );
}

export  default Connections;