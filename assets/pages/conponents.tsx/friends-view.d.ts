import React from "react";
import { Friend, User } from "@prisma/client";
interface FriendResultViewProps {
    result: {
        user: User;
        friend?: Friend;
    };
}
declare const FriendResultView: React.FC<FriendResultViewProps>;
interface FriendViewProps {
    friend: Friend & {
        acceptor?: User;
        requester?: User;
    };
}
declare const FriendView: React.FC<FriendViewProps>;
export { FriendView, FriendResultView };
