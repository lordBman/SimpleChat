export type Person = {
    id: string,
    name: string
    message: string
}

const personView = (person: Person) =>{
    return (
        `<div class="person" tabindex="0" data-id="${person.id}" data-type="user">
            <div class="avatar">${person.name.charAt(0).toUpperCase()}</div>
            <div class="meta">
                <div class="name">${person.name}</div>
                <div class="preview">${person.message}</div>
            </div>
        </div>`
    );
}

export default personView;