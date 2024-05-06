const content = document.getElementById("content");
const loading = document.getElementById("loading");
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
    menuItem.onclick = () =>{
        if(menuItem.id === "logout"){
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            window.location.reload();
        }else{
            document.getElementById(activeMenu).classList.remove("active");
            document.getElementById(`section-${activeMenu}`).style.display = "none";

            menuItem.classList.add("active");
            activeMenu = menuItem.id;
            document.getElementById(`section-${activeMenu}`).style.display = "block";
        }
    }
});

const menu = document.querySelectorAll(".menu")[0];
menu.onmouseover = () =>{
    menu.classList.add("expand");
}

menu.onmouseout = () =>{
    menu.classList.remove("expand");
}

const friendSearchForm = document.getElementById("friend-search-form");
const searchUsersInput = document.getElementById("search-users-input");
const friendsList = document.getElementById("friends-list");
const friendsSearchLoading = document.getElementById("friends-search-loading");
const friendsSearchResults = document.getElementById("friends-search-results");

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

        friendsSearchResults.innerHTML = data.data.map((result)=>{
            return `
                <div class="friends-search-result-item-container">
                    <div class="messages-item-profile-container">
                        <div class="messages-item-profile">${result.user.name.charAt(0).toUpperCase()}</div>
                    </div>
                    <div class="friends-search-result-item-details">
                        <div class="friends-search-result-item-name">${result.user.name}</div>
                        <div class="friends-search-result-item-email">${result.user.email}</div>
                        <div id="friends-search-result-item-buttons-${result.user.id}" style="align-self: end;">
                            ${ result.requesting ? `<button onclick="acceptRequest(${result.user.id})" class="friends-search-result-item-button">Accept</button>` : "" }
                            ${ result.requested ? `<button onclick="cancelRequest(${result.user.id})" class="friends-search-result-item-button">Cancel</button>` : "" }
                            ${ !result.requesting && !result.requested ? `<button onclick="sendRequest('${result.user.id}')" class="friends-search-result-item-button">Request</button>` : "" }
                            ${ result.requesting ? "<button class='friends-search-result-item-button'>Decline</button>" : "" }
                        </div>
                        <div id="friends-search-result-item-loading-${result.user.id}" class="loading" style="display:none;"></div>
                    </div>
                </div>
            `;
         }).join("");
    }).catch((error)=>{
        alert(error);
    });
});

const sendRequest = (id) =>{
    const buttons = document.getElementById(`friends-search-result-item-buttons-${id}`);
    const loading = document.getElementById(`friends-search-result-item-loading-${id}`);
    
    buttons.style.display = "none";
    loading.style.display = "inline";
}