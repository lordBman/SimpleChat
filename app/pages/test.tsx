import React, { createContext, useMemo, useState } from "react";
 
// A Global store for App-wide state management. Provider available in ClientEntry Module
// Care should be taken when using this, so it doesn't cause endless re-render when being updated from different componenets of the APP without proper controller(s)
interface GreyboxStoreProps{
  greyboxStore: { [id: string]: unknown } | undefined,
  updateGreyboxStore: React.Dispatch< React.SetStateAction<{ [id: string]: unknown } | undefined>>;
}


export const GreyboxStore = createContext<GreyboxStoreProps>({  greyboxStore: undefined, updateGreyboxStore: () => undefined });
 
export const StoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  //Contents that goes in Modal pop-up
  const [greyboxStore, updateGreyboxStore] = useState<{ [id: string]: unknown }>();

  const thisStoreContent = useMemo(() => {
    return { greyboxStore, updateGreyboxStore };
  }, [greyboxStore]);
 
  return (
    <GreyboxStore.Provider value={thisStoreContent}>
      {children}
    </GreyboxStore.Provider>
  );
};