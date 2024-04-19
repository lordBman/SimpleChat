declare class FriendSearchManager {
    friendSearchForm: HTMLElement;
    searchUsersInput: HTMLInputElement;
    friendsList: HTMLElement;
    friendsSearchLoading: HTMLElement;
    friendsSearchResults: HTMLElement;
    private constructor();
    private clear;
    private show;
    private loading;
    private static manager?;
    static instance: () => FriendSearchManager;
}
export { FriendSearchManager };
