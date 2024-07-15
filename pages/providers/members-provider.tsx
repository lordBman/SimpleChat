import * as React from 'react';
import { useState } from 'react';
import { useMutation } from 'react-query';
import { ProjectKey, axiosInstance } from '../utils';
import { AppContext, AppContextType } from './app-provider';
import { FriendResponse, MemberResponse } from '../responses';

interface MembersState{
    loading: boolean,
    isError: boolean,
    message?: any, 
    members: MemberResponse[],
}

export type MembersContextType = {
    loading: boolean,
    isError: boolean,
    message?: any, 
    members: MemberResponse[],
    refreshMembers: CallableFunction
}

export const MembersContext = React.createContext<MembersContextType | null>(null);

const MembersProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { data } = React.useContext(AppContext) as AppContextType;
    const [membersState, setMembersState] = useState<MembersState>({ loading: false, isError: false, members: data?.members!  });

    const refreshMembersMutation = useMutation({
        mutationKey:  ["groups"],
        mutationFn: () => axiosInstance.get(`/groups?key=${ProjectKey}`),
        onMutate:()=> setMembersState(init => { return { ...init, loading: true, isError: false, messages: "refreshing friends list"}}),
        onSuccess(data) {
            setMembersState(init => { return { ...init, loading: false, isError: false, message: "", friends: data.data }});
        },
        onError(error) {
            setMembersState(init => { return { ...init, isError: true, loading: false, message: error}});
        }
    });

    const refreshMembers = () => refreshMembersMutation.mutate();

    return (
        <MembersContext.Provider value={{ ...membersState, refreshMembers }}>{ children }</MembersContext.Provider>
    );
}

export default MembersProvider;