import {useState} from 'react';

export default function useUploadDownloadMedia(item, isSelf, isGroup) {
  const [isStopDownloadUpload, setisStopDownloadUpload] = useState(false);
  const [progressValue, setprogressValue] = useState(0);

  return [
    isStopDownloadUpload,
    progressValue,
    isEnableProgress,
    isDownloadProcess,
    isUploadProcess,
    onStopDownloadUpload,
  ];
}
