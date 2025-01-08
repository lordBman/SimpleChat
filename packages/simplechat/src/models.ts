export type AccessKey = {
    name: string;
    id: string;
    key: string;
    enabled: boolean;
    projectID: string;
}

export type Chat = {
    id: number;
    message: string;
    created: Date;
    delivered: boolean;
    senderID: string;
    ownerID: string;
    type: "Group" | "Friends";
    referenceID: number | null;
    sender: Credential;
}

export type Credential = {
    name: string;
    id: string;
    username: string | null;
    email: string | null;
    surname: string;
    adminID: string | null;
}

export type Friend = {
    id: string;
    organizationID: number | null;
    projectID: string;
    accepted: boolean;
    requester: Credential;
    acceptor: Credential;
}

export type Group = {
    name: string;
    id: string;
    last: Date;
    attachment: string | null;
    organizationID: number | null;
    projectID: string;
    creator: Credential;
}

export type Member = {
    role: "Member" | "Admin";
    credentialID: string;
    joined: Date;
    accepted: boolean;
    group: Group;
}

export type Project = {
    name: string;
    id: string;
    ownerID: string;
    token: string;
}

export type Chats = { [key: string]: Chat[] };