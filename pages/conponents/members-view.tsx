import React, { useContext } from "react";
import { ChatContext, ChatContextType } from "../chat/providers/chats-provider";
import { MembersContext, MembersContextType } from "../chat/providers/members-provider";
import { GroupResponse, MemberResponse } from "../responses";

export interface MemberViewProps{
    member: MemberResponse
}

const MemberView: React.FC<MemberViewProps> = ({ member }) =>{
    const { refreshMembers } = useContext(MembersContext) as MembersContextType;
    const { makeCurrent } = useContext(ChatContext) as ChatContextType;

    return (
        <div>{member.group.name}</div>
    );
}

export interface MemberResultViewProps{ 
    group: GroupResponse, member?: MemberResponse 
}
const MemberResultView: React.FC<MemberResultViewProps> = ({ group, member }) =>{
    const { refreshMembers } = useContext(MembersContext) as MembersContextType;
    const { makeCurrent } = useContext(ChatContext) as ChatContextType;

    return (
        <div>{group.name}</div>
    );
}

export { MemberView, MemberResultView }