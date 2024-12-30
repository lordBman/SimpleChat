import { Credential, Friend, Chat, Group, Member} from "@prisma/client";

export type ChatResponse = Chat & { sender: Credential }
export type ChatsResponse = { [key: string]: ChatResponse[] };

export type GroupResponse = Group & { creator: Credential };
export type MemberResponse = Member & { group: GroupResponse };

export type FriendResponse = Friend & { acceptor: Credential, requester: Credential };