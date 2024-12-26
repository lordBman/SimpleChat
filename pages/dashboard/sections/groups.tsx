import React, { useContext, useMemo, useState } from "react";
import { MembersContext, MembersContextType } from "../../providers/members-provider";
import { MemberResultView, MemberView } from "../../conponents/members-view";
import { useMutation } from "react-query";
import { ProjectKey, axiosInstance } from "../../utils";
import { GroupResponse, MemberResponse } from "../../responses";

const Groups = () =>{
    const { members } = useContext(MembersContext) as MembersContextType;
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ group: GroupResponse, member?: MemberResponse }[]>([]);
    const [createState, setCreateState] = useState({ isOpen: false, name: "" });
    
    const searchMutation = useMutation({
        mutationKey:  ["groups"],
        mutationFn: (variables: string)=> axiosInstance.get(`/groups/search?query=${variables}&key=${ProjectKey}`),
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
                <button onClick={open} style={{ border: "none", backgroundColor: "grey", color: "white", borderRadius: 5, height: "100%", aspectRatio: 1, fontSize: 26 }}>
                    <span className="fluent--channel-add-24-regular"></span>
                </button>
            </div>
            { createState.isOpen && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", padding: 10, backgroundColor: "white", borderRadius: 8, width: "100%", gap: 8 }}>
                    <span className="mdi--cancel-circle" style={{ fontSize: 30, color: "grey" }} onClick={close}></span>
                    <form style={{ display: "flex", flexDirection: "row", width: "100%", gap: 8 }} onSubmit={onCreate}>
                        <input id="search-groups"  style={{ flex: 1, padding: 4,  }} onChange={onNameChange} className="group-create-input" placeholder="choose name" />
                        <button type="submit" style={{ border: "none", backgroundColor: "grey", color: "white", borderRadius: 5, height: "100%", fontSize: 14, fontWeight: 400 }}>Create</button>
                    </form>
                </div>
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