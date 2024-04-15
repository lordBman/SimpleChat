import axios from "axios";
import { findElement } from "./utils";
import React from "react";

const content = findElement("content");
const loading = findElement("loading");
window.onload = () =>{
    loading.style.display = "none";
    content.style.display = "flex";
}

const axiosInstance =  axios.create({
	headers: { 
		'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true',
		'Content-Type': 'application/x-www-form-urlencoded' 
	},
	withCredentials: true, 
	baseURL: "http://localhost:5000", });

const menuItems = document.querySelectorAll(".menu-item");

let activeMenu = "chats";
menuItems.forEach((menuItem)=>{
    (menuItem as HTMLElement).onclick = () =>{
        if(menuItem.id === "logout"){
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            window.location.reload();
        }else{
            findElement(activeMenu).classList.remove("active");
            findElement(`section-${activeMenu}`).style.display = "none";

            menuItem.classList.add("active");
            activeMenu = menuItem.id;
            findElement(`section-${activeMenu}`).style.display = "block";
        }
    }
});

const menu = document.querySelectorAll(".menu")[0] as HTMLElement;
menu.onmouseover = () =>{
    menu.classList.add("expand");
}

menu.onmouseout = () =>{
    menu.classList.remove("expand");
}

const friendSearchForm = findElement("friend-search-form");
const searchUsersInput = findElement("search-users-input") as HTMLInputElement;
const friendsList = findElement("friends-list");
const friendsSearchLoading = findElement("friends-search-loading");
const friendsSearchResults =findElement("friends-search-results");

searchUsersInput.addEventListener("input", ()=>{
    alert(JSON.stringify(searchUsersInput.value));
});

friendSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    friendsList.style.display = "none";
    friendsSearchLoading.style.display = "grid";

    const query = searchUsersInput.value;

    axiosInstance.get(`/friends/search?query=${query}`).then((data)=>{
        friendsSearchLoading.style.display = "none";
        friendsSearchResults.style.display = "block";

        friendsSearchResults.innerHTML = data.data.map((result: any)=>{
            return (
                <div className="friends-search-result-item-container">
                    <div className="messages-item-profile-container">
                        <div className="messages-item-profile">{result.user.name.charAt(0).toUpperCase()}</div>
                    </div>
                    <div className="friends-search-result-item-details">
                        <div className="friends-search-result-item-name">{result.user.name}</div>
                        <div className="friends-search-result-item-email">{result.user.email}</div>
                        <div id="friends-search-result-item-buttons-${result.user.id}" style={{ alignSelf: 'end'}}>
                            { result.requesting && <button onClick={()=> acceptRequest(result.user.id)} className="friends-search-result-item-button">Accept</button> }
                            { result.requested && <button onClick={ ()=> cancelRequest(result.user.id) } className="friends-search-result-item-button">Cancel</button> }
                            { !result.requesting && !result.requested && <button onClick={ ()=> sendRequest(result.user.id) } className="friends-search-result-item-button">Request</button> }
                            { result.requesting && <button className='friends-search-result-item-button'>Decline</button> }
                        </div>
                        <div id={`friends-search-result-item-loading-{result.user.id}`} className="loading" style={{display: "none" }}></div>
                    </div>
                </div>
            );
         }).join("");
    }).catch((error)=>{
        alert(error);
    });
});

const sendRequest = (id: string) =>{
    const buttons = findElement(`friends-search-result-item-buttons-${id}`);
    const loading = findElement(`friends-search-result-item-loading-${id}`);
    
    buttons.style.display = "none";
    loading.style.display = "inline";
}

const acceptRequest = (id: string) =>{

}

const cancelRequest = (id: string) =>{
}