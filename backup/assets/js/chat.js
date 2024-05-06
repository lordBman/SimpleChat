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

const formatTime = (date) =>{
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${ hours > 12 ? (hours % 12) : hours }:${minutes}${(hours / 12) === 0 ? "am" : "pm" }`;
}

const mychat = (name, message) =>{
    return `
        <div class="my-chat-container">
            <div class="chat-container-content">
                <div class="my-chat-name">Me</div>
                <div class="my-chat">${message}</div>
                <div class="my-chat-time">${formatTime(new Date())}</div>
            </div>
            <div class="messages-item-profile-container">
                <div class="messages-item-profile">${name.charAt(0).toUpperCase()}</div>
            </div>
        </div>
    `;
}

const token = getCookie("token");

// Make connection
const socket = io.connect("http://localhost:5000", {
    auth: {
        token,
        access: "access-key"
    }
});

const chatContainer = document.getElementById("chats-container");
const message = document.getElementById("message");

const send = () =>{
    const value = message.value;
    if(value.length){
        chatContainer.innerHTML += mychat("Nobel", value);
        message.value = "";
    }
}

    // Query Dom
    /*
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