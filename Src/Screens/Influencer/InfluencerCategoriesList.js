import {FlatList, Keyboard, StyleSheet, View} from 'react-native';
import React from 'react';
import SmallButton from '../../Components/SmallButton';
import {COLORS} from '../../Utilities/Colors';
import {useInfluencerCategoryList} from '../../Utilities/StoreData';

const InfluencerCategoriesList = ({selectedCategoryId, onSelectCategory}) => {
  const categoryList = useInfluencerCategoryList() ?? [];

  console.log(categoryList, 'LIST');

  const renderCategoryItem = ({item}) => {
    return (
      <SmallButton
        buttonText={item.name}
        containerStyle={{
          ...styles.smallButton,
          paddingHorizontal: 18,
          backgroundColor:
            selectedCategoryId === item.id ? COLORS.secondary : COLORS.white,
        }}
        buttonTextStyle={{
          color: selectedCategoryId === item.id ? COLORS.white : COLORS.black,
        }}
        onPress={() => {
          Keyboard.dismiss();

          onSelectCategory(selectedCategoryId === item.id ? null : item.id);
        }}
      />
    );
  };

  return (
    <View style={styles.categoriesContainer}>
      {categoryList.length > 0 && (
        <View style={{height: 40}}>
          <FlatList
            data={categoryList}
            renderItem={renderCategoryItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => {
              return <View style={{height: 10, width: 10}} />;
            }}
            keyExtractor={item => item.id.toString()}
          />
        </View>
      )}
    </View>
  );
};

export default InfluencerCategoriesList;

const styles = StyleSheet.create({
  categoriesContainer: {
    paddingVertical: 5,

    justifyContent: 'center',
  },
  smallButton: {
    height: '100%',
  },
});
