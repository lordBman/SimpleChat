export type Roles = "Admin" | "Client" | "Developer"; 

type Credential = {
    id: string;
    name: string;
    surname: string;
    username?: string | null;
    email?: string | null;
    adminID?: string | null;
    role?: Roles
}

export default Credential;