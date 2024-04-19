import { ReactUtils, axiosInstance, findElement } from "./utils";
import React, { useState } from "react";

interface FriendsViewProps{
    result: any
}

const FriendsView: React.FC<FriendsViewProps> = ({ result }) =>{
    const [loading, setLoading] = useState(false);

    const sendRequest = () =>{
        setLoading(true);
    }
    
    const acceptRequest = () =>{
        setLoading(true);
    }
    
    const cancelRequest = () =>{
        setLoading(true);
    }

    return (
        <div className="friends-search-result-item-container">
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{result.user.name.charAt(0).toUpperCase()}</div>
            </div>
            <div className="friends-search-result-item-details">
                <div className="friends-search-result-item-name">{result.user.name}</div>
                <div className="friends-search-result-item-email">{result.user.email}</div>
                { !loading && <div id="friends-search-result-item-buttons-${result.user.id}" style={{ alignSelf: 'end'}}>
                    { result.requesting && <button onClick={acceptRequest} className="friends-search-result-item-button">Accept</button> }
                    { result.requested && <button onClick={cancelRequest} className="friends-search-result-item-button">Cancel</button> }
                    { !result.requesting && !result.requested && <button onClick={sendRequest} className="friends-search-result-item-button">Request</button> }
                    { result.requesting && <button className='friends-search-result-item-button'>Decline</button> }
                </div> }
                { loading && <div id={`friends-search-result-item-loading-{result.user.id}`} className="loading"></div> }
            </div>
        </div>
    );
}

class FriendSearchManager{
    friendSearchForm = findElement("friend-search-form");
    searchUsersInput = findElement("search-users-input") as HTMLInputElement;
    friendsList = findElement("friends-list");
    friendsSearchLoading = findElement("friends-search-loading");
    friendsSearchResults =findElement("friends-search-results");

    private constructor(){
        this.searchUsersInput.addEventListener("input", ()=>{
            alert(JSON.stringify(this.searchUsersInput.value));
        });
        
        this.friendSearchForm.addEventListener("submit", (event) => {
            event.preventDefault();
        
            this.loading();
        
            const query = this.searchUsersInput.value;
        
            axiosInstance.get(`/friends/search?query=${query}`).then((data)=>{
                this.clear();
        
                ReactUtils.append(this.friendsSearchResults, data.data.map((result: any)=> <FriendsView result={result} />));

                this.show();
            }).catch((error)=>{
                alert(error);
            });
        });
    }

    private clear = () => this.friendsSearchResults.innerHTML = "";
    private show = () => {
        this.friendsSearchLoading.style.display = "none";
        this.friendsSearchResults.style.display = "block";
    }

    private loading = () =>{
        this.friendsList.style.display = "none";
        this.friendsSearchLoading.style.display = "grid";
    }

    private static manager?: FriendSearchManager;
    public static instance = (): FriendSearchManager =>{
        if(FriendSearchManager.manager){
            return FriendSearchManager.manager;
        }
        FriendSearchManager.manager = new FriendSearchManager;

        return FriendSearchManager.manager; 
    }
}

export { FriendSearchManager }