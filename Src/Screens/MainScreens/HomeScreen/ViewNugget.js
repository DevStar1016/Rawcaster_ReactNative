import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useRoute} from '@react-navigation/native';
import {useToken} from '../../../Utilities/StoreData';
import {getNuggetDetailService} from '../../../Services/ApiService';
import Loader from '../../../Components/Loader';
import Nugget from './Nugget';
import DefaultBackground from '../../../Components/DefaultBackground';
var isMount = true;
const ViewNugget = () => {
  const route = useRoute();
  const token = useToken();
  const [isLoading, setisLoading] = useState(true);
  const [nuggetData, setnuggetData] = useState(null);
  const [errorText, seterrorText] = useState('');

  useEffect(() => {
    isMount = true;
    if (!route.params?.id) {
      return;
    }
    getNuggetDetails();
    return () => {
      isMount = false;
    };
  }, []);

  const getNuggetDetails = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', route.params.id);
    getNuggetDetailService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            seterrorText('');
            // setnuggetData()
          }
        } else if (res.data.status === 0) {
          if (isMount) {
            seterrorText(res.data.msg);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          seterrorText(e.message);
        }
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  if (!nuggetData || isLoading || errorText) {
    return (
      <DefaultBackground
        isEnableLoading={isLoading}
        centerText={
          isLoading
            ? 'Loading Nugget'
            : errorText
            ? errorText
            : 'Something went wrong'
        }
      />
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Nugget nugget={item} nuggetIndex={index} />
    </View>
  );
};

export default ViewNugget;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'red',
  },
  errorTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
