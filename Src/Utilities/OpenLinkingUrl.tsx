import {Linking} from 'react-native';
import {decode} from 'base-64';
import queryString from 'query-string';

const handleOpenUrl = (url: string) => {
  Linking.openURL(url)
    .then(res => {
      console.log(res, url, 'LINKING RESPONSE');
    })
    .catch(e => {
      console.log(e, url, 'ERROR   CATCH');
    });
};

const OpenLinkingUrl = (url?: string | null) => {
  if (url && !url.includes('rawcaster://')) {
    const parsedUrl: any = queryString.parseUrl(url);

    if (url?.includes('share')) {
      handleOpenUrl(`rawcaster://viewnugget/${decode(parsedUrl.query.id)}`);
    } else if (url?.includes('signup')) {
      handleOpenUrl(`rawcaster://signup/${parsedUrl.query.ref}`);
    }
  }
};

export default OpenLinkingUrl;
