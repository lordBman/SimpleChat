const content = document.getElementById("content");
const loading = document.getElementById("loading");

const getCookie = (cname) =>{
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const token = getCookie("token");

const axiosInstance =  axios.create({
	headers: { 
		'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true',
		'Content-Type': 'application/x-www-form-urlencoded' 
	},
	withCredentials: true, 
	baseURL: "http://localhost:5000", });

axiosInstance.get("/users").then((response)=>{
    init(response.data);
}).catch((error)=>{
    alert(error);
});

// Make connection
const socket = io.connect("http://localhost:5000", {
    auth: {
        token,
        access: "access-key"
    }
});


const init = (response) =>{
    const menuItems = document.querySelectorAll(".menu-item");
    let activeMenu = "chats";

    menuItems.forEach((menuItem)=>{
        menuItem.onclick = () =>{
            document.getElementById(activeMenu).classList.remove("active");
            document.getElementById(`section-${activeMenu}`).style.display = "none";

            menuItem.classList.add("active");
            activeMenu = menuItem.id;
            document.getElementById(`section-${activeMenu}`).style.display = "block";
        }
    });

    const profilePicture = document.getElementById("profile-picture");
    profilePicture.innerHTML = `${response.name.charAt(0).toUpperCase()}${response.name.charAt(1).toUpperCase()}`;

    const profileName = document.getElementById("profile-name");
    profileName.innerHTML = `${response.name} Okelekele`;
    // Query Dom
    /*const message = document.getElementById("message");
    const name = document.getElementById("name");
    const handle = document.getElementById("handle");
    const btn = document.getElementById("send");
    const ouptut = document.getElementById("output");
    const feedback = document.getElementById("feedback");

    name.innerHTML = `Hi ${response.name}`;

    // Emit events
    btn.addEventListener("click", () =>{
        socket.emit("chat", {
            message:  message.value,
            handle: handle.value
        });

        message.value = "";
    });

    message.addEventListener("keypress", ()=>{
        socket.emit("typing", handle.value);
    });

    socket.on("chat", (data)=>{
        feedback.innerHTML = "";
        ouptut.innerHTML +=`<p><strong>${data.handle}</strong> ${data.message} </p>`
    });

    socket.on("typing", (data)=>{
        feedback.innerHTML = `<p><em>${data} is typing a message</em></p>`;
    });

    socket.on("connected", ()=>{
        console.log(socket.connected);
    });*/

    loading.style.display = "none";
    content.style.display = "flex";
}