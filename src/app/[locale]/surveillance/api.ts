import axios from 'axios';
import req from '@/utils/req';

export const getVideoUrl = async (accessToken, deviceSerial, channelNo = 1,type=1) => {
  try {
    const videoData = await axios.post(
      'https://open.ys7.com/api/lapp/v2/live/address/get',
      {
        accessToken,
        deviceSerial,
        channelNo,
        type,
        quality: 1,
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

export const getReviewVideoList = async (accessToken, deviceSerial) => {
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

export const getAccessToken = (
  appKey: string,
  appSecret: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post(
        '/get_token/api/lapp/token/get',
        { appKey, appSecret },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .then((res: any) => {
        if (res.code == 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
};
