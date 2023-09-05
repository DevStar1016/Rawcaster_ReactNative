import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, {useState} from 'react';
import HeaderWithBack from '../Components/HeaderWithBack';
import {IconType} from '../Utilities/Icons';
import SearchInput from '../Components/SearchInput';
import {FlatList} from 'react-native-gesture-handler';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from '../Components/SVGIcon';
import ProfileWithBadge from '../Components/ProfileWithBadge';
import StyledText from '../Components/StyledText';
import DefaultBackground from '../Components/DefaultBackground';

type Props = {
  title: string;
  onCloseModal?: () => void;
  onSelectItems: (list: any[]) => void;
  preSelectedIds?: any[];
  isEnableRightIcon?: boolean;
  rightIcon?: IconType;
  list?: any[];
  isEnableMaxSelection?: boolean;
  maxSelectedCount?: number;
  rightButtonType?: 'icon' | 'text';
  rightButtonText?: string;
  isEnableSelection?: boolean;
  displayFieldName?: string;
  noDataText?: string;
  idFieldName?: string;
  imageFieldName?: string;
  isTitleCenter?: boolean;
  isEnableLocalSearch?: boolean;
  rightButtonTextStyle?: TextStyle;
  itemTextContainerStyle?: ViewStyle;
  rightTextButtonStyle?: ViewStyle;
  listContentContainerStyle?: ViewStyle;
};

type RenderProps = {
  item: any;
  index: number;
};

const MultiItemsSelectList = ({
  title = '',
  onCloseModal,
  preSelectedIds = [],
  onSelectItems,
  isEnableRightIcon = true,
  rightIcon = 'tick',
  list = [],
  itemTextContainerStyle,
  isEnableMaxSelection = false,
  maxSelectedCount = 0,
  isEnableSelection = true,
  isEnableLocalSearch = true,
  noDataText = 'No Category found',
  rightButtonType = 'icon',
  rightButtonText = '',
  displayFieldName,
  imageFieldName,
  idFieldName,
  isTitleCenter = true,
  rightButtonTextStyle,
  rightTextButtonStyle,
  listContentContainerStyle,
}: Props) => {
  const [selectedIdsList, setselectedIdsList] = useState<any[]>(
    preSelectedIds ?? [],
  );
  const [searchText, setsearchText] = useState('');

  /**
   * Returns a filtered list based on the search text and display field name.
   * If search text is provided, it filters the list based on the display field name
   * or the item itself if display field name is not provided.
   * @returns {Array} - The filtered list.
   */
  const getList = () => {
    if (searchText) {
      if (displayFieldName) {
        return [...list].filter((item: any) =>
          item[displayFieldName]
            ?.toLowerCase()
            .includes(searchText.toLowerCase()),
        );
      }
      return [...list].filter((item: any) =>
        item.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    return [...list];
  };

  /**
   * Handles the selection of an item with the given ID.
   * If the item is already selected, it will be deselected.
   * If the item is not selected and the maximum selection count has not been reached,
   * it will be selected.
   * @param {any} id - The ID of the item to handle selection for.
   * @returns None
   */
  const handleSelectItem = (id: any) => {
    if (isSelected(id)) {
      setselectedIdsList(preList =>
        [...preList].filter(itemId => itemId !== id),
      );
    } else {
      if (
        !isEnableMaxSelection ||
        (isEnableMaxSelection && selectedIdsList.length < maxSelectedCount)
      ) {
        setselectedIdsList(preList => [...preList, id]);
      }
    }
  };

  /**
   * Checks if the given ID is selected in the selectedIdsList array.
   * @param {any} id - The ID to check for.
   * @returns {boolean} - True if the ID is selected, false otherwise.
   */
  const isSelected = (id: any) => {
    const tempItemIndex = [...selectedIdsList].findIndex(
      (itemId: any) => itemId === id,
    );
    if (tempItemIndex !== -1) {
      return true;
    }
    return false;
  };

  /**
   * Determines if an item is disabled for selection based on the given conditions.
   * @param {any} item - The item to check for selection.
   * @returns {boolean} - True if the item is disabled for selection, false otherwise.
   */
  const getIsDisabledItemSelect = (item: any) => {
    if (isEnableMaxSelection) {
      if (selectedIdsList.length < maxSelectedCount) {
        return false;
      } else {
        return !selectedIdsList.includes(
          idFieldName ? item[idFieldName] : item,
        );
      }
    }
    return !isEnableSelection;
  };

  const renderItem = ({item}: RenderProps) => {
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            opacity: isEnableMaxSelection
              ? getIsDisabledItemSelect(item)
                ? 0.5
                : 1
              : 1,
          },
        ]}
        disabled={getIsDisabledItemSelect(item)}
        activeOpacity={0.7}
        onPress={() => {
          if (isEnableSelection) {
            handleSelectItem(idFieldName ? item[idFieldName] : item);
          }
        }}>
        {isEnableSelection && (
          <View
            style={[
              styles.checkBox,
              {
                backgroundColor: isSelected(
                  idFieldName ? item[idFieldName] : item,
                )
                  ? COLORS.primary
                  : COLORS.white,
              },
            ]}>
            {isSelected(idFieldName ? item[idFieldName] : item) && (
              <SVGIcon icon="tick" height={12} width={12} />
            )}
          </View>
        )}
        {imageFieldName && (
          <ProfileWithBadge
            profileImage={item[imageFieldName]}
            extraMargin={0}
            isEnableGradient
            padding={0}
            profileSize={50}
            containerStyle={{marginHorizontal: 10}}
          />
        )}
        <View style={[styles.displayTextContainer, itemTextContainerStyle]}>
          <StyledText>
            {displayFieldName ? item[displayFieldName] : item}
          </StyledText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack
        isEnableRightIcon={
          selectedIdsList.length <= 0 ? false : isEnableRightIcon
        }
        rightIcon={rightIcon}
        title={title}
        isTitleCenter={isTitleCenter}
        rightIconSize={20}
        rightButtonTextStyle={rightButtonTextStyle}
        rightTextButtonStyle={rightTextButtonStyle}
        rightButtonText={rightButtonText}
        rightButtonType={rightButtonType}
        isEnableSafeArea
        isModal={true}
        onPressRightIcon={() => {
          onSelectItems(selectedIdsList);
        }}
        setModal={onCloseModal}
      />
      <View style={styles.contentContainer}>
        {isEnableLocalSearch && (
          <SearchInput
            onSearch={setsearchText}
            searchWhenClickedButton={false}
            marginHorizontal={15}
            marginTop={10}
          />
        )}
        {getList().length > 0 ? (
          <View
            style={[
              styles.listContainer,
              {paddingTop: isEnableLocalSearch ? 10 : 0},
            ]}>
            <FlatList
              data={getList()}
              keyboardShouldPersistTaps={'handled'}
              contentContainerStyle={listContentContainerStyle}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => {
                return <View style={{height: 10}} />;
              }}
            />
          </View>
        ) : (
          <DefaultBackground centerText={noDataText} />
        )}
      </View>
    </View>
  );
};

export default MultiItemsSelectList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 10,
  },
  checkBox: {
    height: 20,
    width: 20,
    borderRadius: 20 / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayTextContainer: {
    flex: 1,
  },
});
