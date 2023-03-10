import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import SmallButton from '../../Components/SmallButton';
import {COLORS} from '../../Utilities/Colors';
import {getInfluencerCategoryService} from '../../Services/ApiService';
import {useToken} from '../../Utilities/StoreData';
import {getAuthCode} from '../../Utilities/Methods';

const InfluencerCategoriesList = ({selectedCategoryId, onSelectCategory}) => {
  const token = useToken();
  const [categoryList, setcategoryList] = useState([]);
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    getInfluencerCategoriesAPICall();
  }, []);

  const getInfluencerCategoriesAPICall = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));

    getInfluencerCategoryService(formData)
      .then(res => {
        if (res.data.status === 1) {
          setcategoryList(res.data.influencer_category);
        }
      })
      .catch(e => {
        console.log(e, 'getInfluencerCategoryServiceERROR');
      })
      .finally(() => {
        setisLoading(false);
      });
  };

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
      {isLoading ? (
        <ActivityIndicator
          color={COLORS.secondary}
          size="small"
          style={{alignSelf: 'center'}}
        />
      ) : (
        categoryList.length > 0 && (
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
        )
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
