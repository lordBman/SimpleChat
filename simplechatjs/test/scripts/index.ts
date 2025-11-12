import { escapeHtml, formatTime } from "./utils";

// Simple demo data and behavior
const conversations: { [key: string]: { from: string, text: string, time: string }[] } = {
    "alice": [
        {from:'them', text:'Hey! Are we still on for tonight?', time:'18:02'},
        {from:'me', text:'Yes! Meet at 8?', time:'18:05'},
    ],
    "bob": [
        {from:'them', text:'I uploaded the report.', time:'11:00'},
        {from:'me', text:'Thanks, I will review.', time:'11:12'},
    ],
    "charlie": [
        {from:'them', text:'On my way', time:'09:40'}
    ],
    "family": [
        {from:'them', text:'Dinner at 7?', time:'20:01'},
        {from:'me', text:'Perfect!', time:'20:04'}
    ],
    "work": [
        {from:'them', text:'Reminder: stand-up at 10', time:'09:00'}
    ]
};

const headerName = document.getElementById('header-name');
if(!headerName){
    throw Error("unable to get headerName Element");
}

const headerAvatar = document.getElementById('header-avatar');
if(!headerAvatar){
    throw Error("unable to get headerAvatar Element");
}

const headerSub = document.getElementById('header-sub');
if(!headerSub){
    throw Error("unable to get headerSub Element");
}

const messagesEl = document.getElementById('messages');
if(!messagesEl){
    throw Error("unable to get messagesEl Element");
}

const input = document.getElementById('message-input') as HTMLInputElement | null;
if(!input){
    throw Error("unable to get input Element");
}

const sendBtn = document.getElementById('send-btn');
if(!sendBtn){
    throw Error("unable to get sendBtn Element");
}

const search = document.getElementById('search') as HTMLInputElement | null;
if(!search){
    throw Error("unable to get search Element");
}

let activeId: string | undefined = undefined;

const renderConversation = (id: string) => {
    activeId = id;
    const activeEl = document.querySelector('.person.active');
    if(activeEl){
        activeEl.classList.remove('active');
    }
    const newActive = document.querySelector(`.person[data-id="${id}"]`);
    if(newActive){
        newActive.classList.add('active');
    }

    const name = newActive ? newActive.querySelector('.name')!.textContent : 'Conversation';
    headerName.textContent = name;
    headerAvatar.textContent = name.charAt(0).toUpperCase();
    headerSub.textContent = newActive ? ((newActive as HTMLElement).dataset.type === 'group' ? 'Group chat' : 'Direct message') : '';

    messagesEl.innerHTML = '';
    let convo = conversations[id] || [];
    convo.forEach(m => {
        const div = document.createElement('div');
        div.className = 'msg ' + (m.from === 'me' ? 'msg-me' : 'msg-them');
        div.innerHTML = `<div>${escapeHtml(m.text)}</div><small>${m.time || ''}</small>`;
        messagesEl.appendChild(div);
    });
    // scroll to bottom
    setTimeout(()=> messagesEl.scrollTop = messagesEl.scrollHeight, 30);
}

function sendMessage(){
    if(input && messagesEl){
        const text = input.value.trim();
        if(!text || !activeId) return;
        const time = formatTime();
        const msg = {from:'me', text, time};
        conversations[activeId] = conversations[activeId] || [];
        conversations[activeId].push(msg);
        const div = document.createElement('div');
        div.className = 'msg msg-me';
        div.innerHTML = `<div>${escapeHtml(text)}</div><small>${time}</small>`;
        messagesEl.appendChild(div);
        input.value = '';
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }
}  

// attach click handlers for persons
document.querySelectorAll('.person').forEach(el => {
    el.addEventListener('click', () => renderConversation((el as HTMLElement).dataset.id!));
    (el as HTMLElement).onkeydown = (ev: KeyboardEvent) =>{
        if(ev.key === 'Enter') renderConversation((el as HTMLElement).dataset.id!);
    }
});

sendBtn.onclick = sendMessage;
input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }
});

// simple search filter
search.addEventListener('input', (e) => {
    const q = search.value!.toLowerCase();
    document.querySelectorAll('.person').forEach(p => {
        const name = p.querySelector('.name')!.textContent.toLowerCase();
        const preview = p.querySelector('.preview')?.textContent.toLowerCase() || '';
        (p as HTMLElement).style.display = (name.includes(q) || preview.includes(q)) ? '' : 'none';
    });
});

// initial selection
renderConversation('alice');