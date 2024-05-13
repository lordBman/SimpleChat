import React, { useContext, useMemo, useState } from "react";
import { MembersContext, MembersContextType } from "../providers/members-provider";
import { MemberResultView, MemberView } from "../../conponents/members-view";
import { useMutation } from "react-query";
import { axiosInstance } from "../../utils";
import { GroupResponse, MemberResponse } from "../../responses";

const Groups = () =>{
    const { members } = useContext(MembersContext) as MembersContextType;
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ group: GroupResponse, member?: MemberResponse }[]>([]);
    const [createState, setCreateState] = useState({ isOpen: false, name: "" });
    
    const searchMutation = useMutation({
        mutationKey:  ["groups"],
        mutationFn: (variables: string)=> axiosInstance.get(`/groups/search?query=${variables}`),
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
        mutationKey:  ["groups"],
        mutationFn: (variables: string)=> axiosInstance.get(`/groups/search?query=${variables}`),
        onSuccess: (data) =>{
            setResults(data.data);
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
        setCreateState(init => ({...init, name: event.currentTarget.value }));
    }

    const memberViews = useMemo(()=>{
        const sortedMembers = members.sort((a, b)=>{
            return a.group.name.localeCompare(b.group.name);
        });

        const init = [];
        let [letter, index] = [ "", 0 ];
        while(index < sortedMembers.length){
            const member = sortedMembers[index];
            const name = member.group.name;
            if(name.charAt(0).toUpperCase() === letter){
                init.push(<MemberView member={member} key={index} />);
                index += 1;
            }else{
                letter = name.charAt(0).toUpperCase();
                init.push(
                    <div style={{ marginTop: 10, color: "gray" }}>
                        <h2>{letter}</h2>
                    </div>
                );
            }
        }
        return init;
    }, [members]);

    return (
        <div className="chats-main-container">
            <div className="section-title">
                <h2 className="chats-title">Groups</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: 8 }}>
                <form className="search-form" style={{ flex: 1 }} onSubmit={onSearch}>
                    <span className="formkit--search"></span>
                    <input id="search-groups" onChange={onQueryChange} className="search-input" type="search" placeholder="search groups ..." />
                </form>
                <button style={{ border: "none", backgroundColor: "grey", color: "white", borderRadius: 5, height: "100%", aspectRatio: 1, fontSize: 20, fontWeight: 600 }}>+</button>
            </div>
            { createState.isOpen && (
                <form className="search-form" style={{ display: "flex", flexDirection: "row", width: "100%", gap: 8 }} onSubmit={onCreate}>
                    <input id="search-groups" onChange={onQueryChange} className="group-create-input" placeholder="choose name" />
                    <button type="submit" style={{ border: "none", backgroundColor: "grey", color: "white", borderRadius: 5, height: "100%", fontSize: 16, fontWeight: 400 }}>Creatte</button>
                </form>
            ) }
            { query.length <= 0 && <div id="members-list">{ memberViews }</div> }
            { searchMutation.isLoading && <div id="friends-search-loading">
                <span>Loading...</span>
            </div> }
            { query.length > 0 && <div id="friends-search-results">{results.map((result, index)=> <MemberResultView member={result.member} group={result.group} key={index}/>)}</div> }
        </div>
    );
}

export  default Groups;