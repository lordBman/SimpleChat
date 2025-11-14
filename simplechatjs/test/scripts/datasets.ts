import { Client, Details } from "@simplechat/shared/models";

const details: Details = {
    id: "me",
    name: "Nobel",
    surname: "Okelekele",
    username: "nobel44",
    email: "okelekelenobel@gmail.com",
}

const client: Client = {
    id: details.id,
    details,
    projectID: "test",
    created: new Date()
}

