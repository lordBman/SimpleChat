import React from "react";
import { FriendsView } from "./components";
import { ReactUtils, axiosInstance, findElement } from "./utils";

class FriendSearchManager{
    friendSearchForm = findElement("friend-search-form");
    searchUsersInput = findElement("search-users-input") as HTMLInputElement;
    friendsList = findElement("friends-list");
    friendsSearchLoading = findElement("friends-search-loading");
    friendsSearchResults =findElement("friends-search-results");

    private constructor(){
        this.friendSearchForm.addEventListener("submit", (event) => {
            event.preventDefault();
        
            this.loading();
        
            const query = this.searchUsersInput.value;
        
            axiosInstance.get(`/friends/search?query=${query}`).then((data)=>{
                this.clear();
        
                if(data.data.length > 0){
                    ReactUtils.append(this.friendsSearchResults, data.data.map((result: any)=> <FriendsView result={result} />));
                }else{
                    this.friendsSearchResults.innerHTML = `No User found with the name: ${query}`;
                }
            }).catch((error)=>{
                alert(error);
            }).finally(()=> this.show());
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