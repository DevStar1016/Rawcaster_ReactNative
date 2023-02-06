import {useSelector} from 'react-redux';

export const useToken = () => {
  return useSelector(state => state.auth.token);
};

export const useStatusBarColor = () => {
  return useSelector(state => state.utility.statusBarColor);
};
