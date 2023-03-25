import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import StyledText from '../../../Components/StyledText';
import SVGIcon from '../../../Components/SVGIcon';
import {COLORS} from '../../../Utilities/Colors';
import {DIMENSIONS} from '../../../Utilities/Constants';
import {useToken} from '../../../Utilities/StoreData';
import {
  listAllFriendGroupsService,
  listAllFriendsService,
} from '../../../Services/ApiService';
import {getSlicedText} from '../../../Utilities/Methods';
import {FONTS} from '../../../Utilities/Fonts';

type Props = {
  titleText: string;
  selectAllButtonText: string;
  isVisible?: boolean;
  onPressSelectAll: (listOfIds: any, status: boolean) => void;
  selectedIdsList: [];
  selectedAllButtonText: string;
  displayFieldName: string;
  idFieldName: string;
  type: 'connection' | 'group';
  onPressItem: (itemId: any) => void;
};
var isMount = true;
const ConnectionGroupsListContainer = ({
  isVisible = true,
  titleText = '',
  selectAllButtonText = '',
  selectedAllButtonText = '',
  onPressSelectAll,
  selectedIdsList = [],
  displayFieldName,
  idFieldName,
  type,
  onPressItem,
}: Props) => {
  const token = useToken();
  const [searchText, setsearchText] = useState('');
  const [isLoading, setisLoading] = useState(true);
  const [list, setlist] = useState([]);
  const inputRef = useRef<TextInput>(null);
  const [isEnableSearchBar, setisEnableSearchBar] = useState(false);

  useEffect(() => {
    isMount = true;
    if (type === 'connection') {
      connectionsAPICall();
    } else if (type === 'group') {
      groupsAPICall();
    }
    return () => {
      isMount = false;
    };
  }, []);

  const connectionsAPICall = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('allfriends', 1);
    formData.append('page_number', 1);
    listAllFriendsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          setlist(res.data.friends_list);
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const groupsAPICall = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('page_number', 1);
    listAllFriendGroupsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          setlist(res.data.friend_group_list);
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const isSelected = (selectedId: any) => {
    const selectedIndex = selectedIdsList.findIndex(id => id === selectedId);
    if (selectedIndex === -1) {
      return false;
    }
    return true;
  };

  const isSelectedAll = () => {
    return selectedIdsList.length === list.length;
  };

  const getSelectedCountText = () => {
    if (selectedIdsList.length > 0) {
      return ` (${selectedIdsList.length})`;
    }
    return '';
  };

  const getFilteredList = () => {
    if (searchText.trim()) {
      return [...list].filter((item: any) =>
        item[displayFieldName]?.includes(searchText.trim()),
      );
    }
    return [...list];
  };

  const renderItem = (item: any, index: number) => {
    return (
      <TouchableOpacity
        key={index.toString()}
        onPress={() => {
          onPressItem(item[idFieldName]);
        }}
        activeOpacity={0.7}
        style={[
          styles.friends,
          {
            backgroundColor: isSelected(item[idFieldName])
              ? COLORS.primary
              : COLORS.borderColor,
          },
        ]}>
        <StyledText
          style={{
            color: isSelected(item[idFieldName]) ? COLORS.white : COLORS.black,
          }}>
          {getSlicedText(item[displayFieldName], 15)}
        </StyledText>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.mainContainer, {display: isVisible ? 'flex' : 'none'}]}>
      <View style={styles.rowContainer}>
        <StyledText>{titleText + getSelectedCountText()}</StyledText>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            value={searchText}
            onChangeText={setsearchText}
            style={[
              styles.inputText,
              {display: isEnableSearchBar ? 'flex' : 'none'},
            ]}
          />
          <SVGIcon
            icon="search_black"
            height={20}
            width={20}
            isButton
            marginLeft={5}
            onPress={() => {
              setisEnableSearchBar(true);
              inputRef.current?.focus();
            }}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            onPressSelectAll(
              list.map((item: any) => item[idFieldName]),
              !isSelectedAll(),
            );
          }}>
          <StyledText>
            {isSelectedAll() ? selectedAllButtonText : selectAllButtonText}
          </StyledText>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.listContainer,
          {
            alignItems: isLoading ? 'center' : undefined,
            justifyContent: isLoading ? 'center' : undefined,
            height: isLoading ? 70 : undefined,
          },
        ]}>
        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} size="small" />
        ) : (
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {getFilteredList().length > 0
              ? [...Array(Math.ceil(getFilteredList().length / 6))].map(
                  (_, index) => {
                    return (
                      <View
                        key={index.toString()}
                        style={styles.listItemMainView}>
                        {getFilteredList().map((item, subIndex) => {
                          if (
                            subIndex < (index + 1) * 6 &&
                            subIndex >= index * 6
                          ) {
                            return renderItem(item, subIndex);
                          }
                          return null;
                        })}
                      </View>
                    );
                  },
                )
              : null}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default ConnectionGroupsListContainer;

const styles = StyleSheet.create({
  mainContainer: {
    paddingVertical: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 7,
  },
  inputText: {
    flex: 1,
    borderBottomWidth: 1,
    fontSize: 14,
    padding: 0.1,
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.black,
  },
  listContainer: {
    paddingVertical: 5,
  },
  listItemMainView: {
    flexDirection: 'row',
    width: DIMENSIONS.window.width,
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  friends: {
    padding: 5,
    backgroundColor: '#E2E2E2',
    borderRadius: 20,
    width: DIMENSIONS.window.width / 2.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 5,
    flexDirection: 'row',
  },
});
