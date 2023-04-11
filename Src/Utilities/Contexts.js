import {createContext, useContext} from 'react';

export const GlobalSearchContext = createContext();
export const useGlobalSearch = () => useContext(GlobalSearchContext);

export const NuggetParentActionsContext = createContext();
export const useNuggetParentActions = () =>
  useContext(NuggetParentActionsContext);

export const NuggetItemActionsContext = createContext();
export const useNuggetItemActions = () => useContext(NuggetItemActionsContext);
