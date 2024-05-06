import { User, Friend, Chat, Group, Member} from "@prisma/client";

export type ChatResponse = Chat & { sender: User }
export type ChatsResponse = { [key: string]: ChatResponse[] };

export type GroupResponse = Group & { creator: User };
export type MemberResponse = Member & { group: GroupResponse };

export type FriendResponse = Friend & { acceptor: User, requester: User  };