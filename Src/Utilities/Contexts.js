import {createContext, useContext} from 'react';

export const GlobalSearchContext = createContext();
export const useGlobalSearch = () => useContext(GlobalSearchContext);

export const MyConnectionsContext = createContext();
export const useMyConnections = () => useContext(MyConnectionsContext);

export const NuggetParentActionsContext = createContext();
export const useNuggetParentActions = () =>
  useContext(NuggetParentActionsContext);

export const NuggetItemActionsContext = createContext();
export const useNuggetItemActions = () => useContext(NuggetItemActionsContext);

export const NoticationsContext = createContext();
export const useNotications = () => useContext(NoticationsContext);

export const DashboardCategoryTopTabContext = createContext();
export const useDashboardTopTabCategories = () =>
  useContext(DashboardCategoryTopTabContext);

export const DashboardProfileContext = createContext();
export const useDashboardProfile = () => useContext(DashboardProfileContext);
