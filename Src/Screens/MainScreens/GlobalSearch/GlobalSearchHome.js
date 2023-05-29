import {Modal, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import HOCView from '../../../Components/HOCView';
import SearchInput from '../../../Components/SearchInput';
import {GlobalSearchContext} from '../../../Utilities/Contexts';
import Loader from '../../../Components/Loader';
import {COLORS} from '../../../Utilities/Colors';
import GlobalSearchTopTabNavigation from '../../../Navigation/TopTabNavigation/GlobalSearch/GlobalSearchTopTabNavigation';

const GlobalSearchHome = () => {
  const [searchText, setsearchText] = useState(null);
  const [focusedTab, setfocusedTab] = useState('Profile');
  const [isActionLoading, setisActionLoading] = useState(false);
  const [topLayerHeight, settopLayerHeight] = useState(0);

  const searchContextValue = {
    searchText: searchText,
    setFocusedTab: setfocusedTab,
    setisActionLoading: setisActionLoading,
    topLayerHeight: topLayerHeight + 50,
  };

  return (
    <GlobalSearchContext.Provider value={searchContextValue}>
      <HOCView
        headerType="header_with_back"
        onLayoutHeaderHeight={height => {
          settopLayerHeight(pre => pre + height);
        }}
        isEnableSafeArea={false}
        paddingHorizontal={0}
        backHeaderProps={{title: 'Search Rawcaster'}}>
        <SearchInput
          marginVertical={10}
          marginHorizontal={15}
          onLayoutHeight={height => {
            settopLayerHeight(pre => pre + height + 20); // 20 is marginVertical 10- search input
          }}
          onSearch={setsearchText}
          placeHolderText={'Search ' + focusedTab}
        />
        <GlobalSearchTopTabNavigation />
      </HOCView>
      <Modal visible={isActionLoading} onRequestClose={() => {}} transparent>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </GlobalSearchContext.Provider>
  );
};

export default GlobalSearchHome;

const styles = StyleSheet.create({});
