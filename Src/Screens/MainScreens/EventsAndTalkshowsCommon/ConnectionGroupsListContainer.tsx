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
import {
  useConnectionsList,
  useGroupsList,
  useToken,
} from '../../../Utilities/StoreData';
import {
  listAllFriendGroupsService,
  listAllFriendsService,
} from '../../../Services/ApiService';
import {getSlicedText} from '../../../Utilities/Methods';
import {FONTS} from '../../../Utilities/Fonts';
import {useDispatch} from 'react-redux';
import {
  setConnectionsList,
  setGroupsList,
} from '../../../Store/Slices/HomeSlice';

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
  const dispatch = useDispatch();
  const [searchText, setsearchText] = useState('');
  const connectionsList = useConnectionsList();
  const groupsList = useGroupsList();
  const [isLoading, setisLoading] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const [isEnableSearchBar, setisEnableSearchBar] = useState(false);

  useEffect(() => {
    isMount = true;
    if (type === 'connection' && connectionsList?.length <= 0) {
      connectionsAPICall();
    } else if (type === 'group' && groupsList?.length <= 0) {
      groupsAPICall();
    }
    return () => {
      isMount = false;
    };
  }, []);

  /**
   * Retrieves a list based on the given type.
   * @returns {Array} - The list of items based on the type.
   */
  const getList = () => {
    if (type === 'connection') {
      return connectionsList;
    } else if (type === 'group') {
      return groupsList;
    }
    return [];
  };

  /**
   * Makes an API call to retrieve a list of connections.
   * @returns None
   */
  const connectionsAPICall = () => {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('allfriends', 1);
    formData.append('page_number', 1);
    listAllFriendsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          dispatch(setConnectionsList(res.data.friends_list));
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  /**
   * Makes an API call to retrieve a list of friend groups.
   * If the component is mounted, it sets the isLoading state to true.
   * It creates a FormData object and appends the token and page_number to it.
   * Then it calls the listAllFriendGroupsService function with the FormData object.
   * If the response status is 1, it dispatches the setGroupsList action with the friend group list data.
   * If there is an error, it catches it and does nothing.
   * Finally, if the component is mounted, it sets the isLoading state to false.
   * @returns None
   */
  const groupsAPICall = () => {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('page_number', 1);
    listAllFriendGroupsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          dispatch(setGroupsList(res.data.friend_group_list));
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  /**
   * Checks if a given ID is selected in the selectedIdsList array.
   * @param {any} selectedId - The ID to check for.
   * @returns {boolean} - True if the ID is selected, false otherwise.
   */
  const isSelected = (selectedId: any) => {
    const selectedIndex = selectedIdsList.findIndex(id => id === selectedId);
    if (selectedIndex === -1) {
      return false;
    }
    return true;
  };

  /**
   * Checks if all items in the selectedIdsList are selected.
   * @returns {boolean} True if all items are selected, false otherwise.
   */
  const isSelectedAll = () => {
    return selectedIdsList.length === getList().length;
  };

  /**
   * Returns the count of selected IDs as a text string.
   * @returns {string} - The count of selected IDs in parentheses, or an empty string if no IDs are selected.
   */
  const getSelectedCountText = () => {
    if (selectedIdsList.length > 0) {
      return ` (${selectedIdsList.length})`;
    }
    return '';
  };

  /**
   * Returns a filtered list based on the search text.
   * If the search text is empty, the original list is returned.
   * @returns {Array} - The filtered list.
   */
  const getFilteredList = () => {
    if (searchText.trim()) {
      return [...getList()].filter((item: any) =>
        item[displayFieldName]?.includes(searchText.trim()),
      );
    }
    return [...getList()];
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
              getList().map((item: any) => item[idFieldName]),
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
