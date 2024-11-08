import axios from 'axios';

export const getVideoUrl = async (accessToken,deviceSerial) => {
  try {
    const videoData = await axios.post(
      'https://open.ys7.com/api/lapp/v2/live/address/get',
      {
        accessToken,
        deviceSerial,
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
