import {createContext, useContext} from 'react';

export const GlobalSearchContext = createContext();
export const useGlobalSearch = () => useContext(GlobalSearchContext);
