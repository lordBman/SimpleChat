import Details from "./details";

export type UserRoles = "Admin" | "Developer"; 

type User = {
    id: string
    details: Details,
    role: UserRoles,
    admin?: User,
    created: Date
}

export default User;