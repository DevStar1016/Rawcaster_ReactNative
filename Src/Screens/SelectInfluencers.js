import {
  FlatList,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import StyledText from '../Components/StyledText';
import SearchInput from '../Components/SearchInput';
import HOCView from '../Components/HOCView';
import LinearGradientButton from '../Components/LinearGradientButton';
import InfluencersItem from '../Components/InfluencersItem';
import SmallButton from '../Components/SmallButton';
import SVGIcon from '../Components/SVGIcon';
import {COLORS} from '../Utilities/Colors';

const SelectInfluencers = () => {
  const dataList = [
    {
      id: 1,
      buttonText: 'Musician',
    },
    {
      id: 2,
      buttonText: 'Priest',
    },
    {
      id: 3,
      buttonText: 'Athlete',
    },
    {
      id: 4,
      buttonText: 'Broadcaster',
    },
  ];
  const renderCategoryItem = ({item}) => {
    return (
      <SmallButton
        buttonText={item.buttonText}
        containerStyle={{...styles.smallButton, paddingHorizontal: 18}}
        onPress={() => {
          Keyboard.dismiss();
        }}
      />
    );
  };

  return (
    <HOCView isEnableScroll={true} paddingHorizontal={0}>
      <View style={styles.contentContainer}></View>
      <View style={styles.titleContainer}>
        <StyledText style={{fontWeight: '700', fontSize: 18}}>
          Welcome Danii - Select your influencers
        </StyledText>
      </View>
      <View style={styles.searchContainer}>
        <View style={{flex: 1, paddingRight: 10}}>
          <SearchInput
            onPressSearch={text => {
              console.log(text);
            }}
            placeHolderText={'Search Influencer by name'}
          />
        </View>

        <SmallButton
          buttonText="Skip"
          isEnableIcon
          containerStyle={styles.smallButton}
          onPress={() => {
            Keyboard.dismiss();
          }}
        />
      </View>
      <View style={styles.categoriesContainer}>
        <FlatList
          data={dataList}
          renderItem={renderCategoryItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => {
            return <View style={{height: 10, width: 10}} />;
          }}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>
      <View style={{paddingHorizontal: 15}}>
        <View style={styles.listHeader}>
          <StyledText>Selected Influencers (03)</StyledText>
          <TouchableOpacity style={styles.becomeFanButton} activeOpacity={0.7}>
            <StyledText>Become a Fan</StyledText>
            <SVGIcon icon="right_arrow" height={13} width={13} marginLeft={5} />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
      </View>
      <SearchInput />

      <InfluencersItem />
    </HOCView>
  );
};

export default SelectInfluencers;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  smallButton: {
    height: 45,
  },
  categoriesContainer: {
    paddingVertical: 5,
  },
  listHeader: {
    paddingTop: 10,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  becomeFanButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    backgroundColor: COLORS.borderColor,
    height: 1.5,
  },
});
