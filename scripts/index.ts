import { findElement } from "./utils";
import { ChatManager } from "./chat";
import { FriendSearchManager } from "./main";

const content = findElement("content");
const loading = findElement("loading");
window.onload = () =>{
    loading.style.display = "none";
    content.style.display = "flex";
}

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

            navigate(activeMenu);
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

const navigate = (menu: string) =>{
    switch(menu){
        case "chats":
            break;
    }
}

ChatManager.instance();
FriendSearchManager.instance();