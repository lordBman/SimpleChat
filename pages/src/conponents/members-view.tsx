import { Group, Member } from "@simplechat/shared";
import React from "react";
import { useMembersContext } from "simplechat_provider/src/contexts";
import { useAppContext } from "../providers/app-provider";

export interface MemberViewProps{
    member: Member
}

const MemberView: React.FC<MemberViewProps> = ({ member }) =>{
    const { refreshMembers } = useMembersContext();
    const { makeCurrent } = useAppContext();

    return (
        <div>{member.group.name}</div>
    );
}

export interface MemberResultViewProps{ 
    group: Group, member?: Member 
}
const MemberResultView: React.FC<MemberResultViewProps> = ({ group, member }) =>{
    const { refreshMembers } = useMembersContext();
    const { makeCurrent } = useAppContext();

    return (
        <div>{group.name}</div>
    );
}

export { MemberView, MemberResultView }