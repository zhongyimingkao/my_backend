import axios from 'axios';

export const getVideoUrl = async () => {
  try {
    const videoData = await axios.post(
      'https://open.ys7.com/api/lapp/v2/live/address/get',
      {
        accessToken:
          'at.aqt97b6g3twrtsrv4j5cyb3l28wcg60z-60u6o5wny5-0r0370i-ailfnzapz',
        deviceSerial: 'FB4114154',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return videoData;
  } catch (error) {
    console.error('error=>', error);
  }
};
