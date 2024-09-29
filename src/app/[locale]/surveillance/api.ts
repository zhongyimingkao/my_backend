import axios from 'axios';

export const getVideoUrl = async () => {
  try {
    const videoData = await axios.post(
      'https://open.ys7.com/api/lapp/v2/live/address/get',
      {
        accessToken:
          'at.9fgihzrsb2cup1ij83ed9vht36fvd3lv-6t73i93na6-17t5tp3-dbitse9ob',
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
