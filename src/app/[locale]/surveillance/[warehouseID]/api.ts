import axios from 'axios';
import req from '@/utils/req';
import { YS7_CONFIG, buildApiUrl, getErrorMessage, timeUtils } from '../config';

export const getVideoUrl = async (accessToken, deviceSerial, channelNo = 1,type=1) => {
  try {
    const videoData = await axios.post(
      buildApiUrl(YS7_CONFIG.ENDPOINTS.LIVE_ADDRESS),
      {
        accessToken,
        deviceSerial,
        channelNo,
        type,
        quality: YS7_CONFIG.DEFAULTS.QUALITY,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return videoData;
  } catch (error) {
    console.error('获取视频地址失败:', error);
    throw error;
  }
};

// 查询设备本地录像 - 使用正确的v3 API，参数放在Header中
export const getLocalRecordList = async (
  accessToken: string, 
  deviceSerial: string, 
  localIndex: string = '1', 
  startTime: Date, 
  endTime: Date,
  recordType?: number,
  pageSize: number = YS7_CONFIG.DEFAULTS.PAGE_SIZE
) => {
  try {
    const startTimestamp = timeUtils.dateToTimestamp(startTime);
    const endTimestamp = timeUtils.dateToTimestamp(endTime);
    
    // 构建Query参数（只包含时间和其他可选参数）
    const params = new URLSearchParams({
      startTime: startTimestamp.toString(),
      endTime: endTimestamp.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (recordType !== undefined) {
      params.append('recordType', recordType.toString());
    }
    
    // 主要参数放在Header中
    const response = await axios.get(
      `${buildApiUrl(YS7_CONFIG.ENDPOINTS.LOCAL_RECORD_QUERY)}?${params.toString()}`,
      {
        headers: {
          'accessToken': accessToken,
          'deviceSerial': deviceSerial,
          'localIndex': localIndex,
        },
      }
    );
    
    console.log('本地录像API响应:', response.data);
    
    if (response.data.meta?.code !== 200) {
      throw new Error(getErrorMessage(response.data.meta?.code?.toString() || 'unknown'));
    }
    
    // 转换数据格式以兼容现有代码
    const records = response.data.data?.records?.map((item: any) => ({
      startTime: timeUtils.dateToApiString(timeUtils.timestampToDate(item.startTime)),
      endTime: timeUtils.dateToApiString(timeUtils.timestampToDate(item.endTime)),
      fileSize: item.size ? parseInt(item.size) : 0,
      duration: item.endTime - item.startTime,
      type: item.type,
    })) || [];
    
    return {
      code: '200',
      data: records,
      hasMore: response.data.data?.hasMore || false,
      nextFileTime: response.data.data?.nextFileTime,
    };
  } catch (error) {
    console.error('获取本地录像列表失败:', error);
    throw error;
  }
};

// 根据时间获取存储文件信息 - 支持云存储和本地录像
export const getVideoByTime = async (
  accessToken: string,
  deviceSerial: string,
  channelNo: number = 1,
  startTime: Date,
  endTime: Date,
  recType: number = YS7_CONFIG.REC_TYPES.AUTO, // 0-自动选择，1-云存储，2-本地录像
  pageSize?: number
) => {
  try {
    const startTimestamp = startTime.getTime();
    const endTimestamp = endTime.getTime();
    
    const requestData: any = {
      accessToken,
      deviceSerial,
      channelNo,
      startTime: startTimestamp,
      endTime: endTimestamp,
      recType,
      version: '2.0', // 返回分页结构
    };
    
    if (pageSize) {
      requestData.pageSize = pageSize;
    }
    
    const response = await axios.post(
      buildApiUrl(YS7_CONFIG.ENDPOINTS.VIDEO_BY_TIME),
      requestData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    console.log('录像查询API响应:', response.data);
    
    if (response.data.code !== '200') {
      throw new Error(getErrorMessage(response.data.code));
    }
    
    // 处理分页结构返回
    let records = [];
    let hasMore = false;
    let nextFileTime = null;
    
    if (response.data.data?.files) {
      // 分页结构返回
      records = response.data.data.files.map((item: any) => ({
        startTime: timeUtils.dateToApiString(new Date(item.startTime)),
        endTime: timeUtils.dateToApiString(new Date(item.endTime)),
        fileSize: item.fileSize || 0,
        duration: Math.floor((item.endTime - item.startTime) / 1000),
        recType: item.recType,
        localType: item.localType,
        fileId: item.fileId,
        fileIndex: item.fileIndex,
      }));
      hasMore = !response.data.data.isAll;
      nextFileTime = response.data.data.nextFileTime;
    } else if (Array.isArray(response.data.data)) {
      // 非分页结构返回
      records = response.data.data.map((item: any) => ({
        startTime: timeUtils.dateToApiString(new Date(item.startTime)),
        endTime: timeUtils.dateToApiString(new Date(item.endTime)),
        fileSize: item.fileSize || 0,
        duration: Math.floor((item.endTime - item.startTime) / 1000),
        recType: item.recType,
        localType: item.localType,
        fileId: item.fileId,
        fileIndex: item.fileIndex,
      }));
    }
    
    return {
      code: '200',
      data: records,
      hasMore,
      nextFileTime,
    };
  } catch (error) {
    console.error('获取录像文件信息失败:', error);
    throw error;
  }
};

// 云存储录像查询 - 使用 getVideoByTime 接口
export const getCloudRecordList = async (
  accessToken: string, 
  deviceSerial: string, 
  channelNo: number = 1, 
  startTime: string, 
  endTime: string
) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return await getVideoByTime(
    accessToken,
    deviceSerial,
    channelNo,
    start,
    end,
    YS7_CONFIG.REC_TYPES.CLOUD // 指定查询云存储
  );
};

// 获取录像回放地址 - 使用 /lapp/v2/live/address/get 接口
export const getPlaybackUrl = async (accessToken: string, deviceSerial: string, channelNo: number = 1, startTime: string, endTime: string, source: number = 1) => {
  try {
    // 根据文档，需要将时间格式转换为正确的格式
    const formatTime = (timeStr: string) => {
      // 如果已经是正确格式，直接返回
      if (timeStr.includes('T') || timeStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        return timeStr;
      }
      // 否则尝试转换
      const date = new Date(timeStr);
      return timeUtils.dateToApiString(date);
    };

    // 使用 /lapp/v2/live/address/get 接口获取回放地址
    // 关键参数：type=2 表示回放，添加 startTime 和 endTime 参数
    const requestData = {
      accessToken,
      deviceSerial,
      channelNo,
      type: 2, // 2-回放，1-直播
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      source,
      quality: YS7_CONFIG.DEFAULTS.QUALITY,
    };

    console.log('🎬 获取回放地址请求参数 (使用live/address/get接口):', requestData);

    const response = await axios.post(
      buildApiUrl(YS7_CONFIG.ENDPOINTS.PLAYBACK_ADDRESS), // 现在指向 /lapp/v2/live/address/get
      requestData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    console.log('📺 录像回放地址API响应:', response.data);
    
    if (response.data.code !== '200') {
      const errorMsg = getErrorMessage(response.data.code);
      console.error('获取回放地址失败:', errorMsg);
      throw new Error(errorMsg);
    }

    // 检查返回的数据结构
    if (!response.data.data) {
      throw new Error('API返回数据格式错误：缺少data字段');
    }

    // 根据文档，返回的数据结构应该包含url字段
    const playbackData = response.data.data;
    
    // 验证必要的字段
    if (!playbackData.url) {
      console.error('回放地址数据异常:', playbackData);
      throw new Error('获取的回放地址为空');
    }

    console.log('✅ 成功获取回放地址:', playbackData.url);
    
    return {
      code: '200',
      data: {
        url: playbackData.url,
        // 保留其他可能的字段
        ...playbackData
      }
    };
  } catch (error: any) {
    console.error('❌ 获取录像回放地址失败:', error);
    
    // 提供更详细的错误信息
    if (error.response) {
      console.error('API响应错误:', error.response.data);
      throw new Error(`API错误: ${error.response.data?.msg || error.response.statusText}`);
    } else if (error.request) {
      console.error('网络请求失败:', error.request);
      throw new Error('网络请求失败，请检查网络连接');
    } else {
      throw error;
    }
  }
};

export const getReviewVideoList = async (accessToken, deviceSerial) => {
  try {
    const videoData = await axios.post(
      buildApiUrl(YS7_CONFIG.ENDPOINTS.LIVE_ADDRESS),
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
    console.error('获取视频列表失败:', error);
    throw error;
  }
};

// 获取AccessToken - 支持两种方式
export const getAccessToken = (
  appKey: string = YS7_CONFIG.APP_KEY,
  appSecret: string = YS7_CONFIG.APP_SECRET
): Promise<any> => {
  return new Promise((resolve, reject) => {
    // 方式1：直接调用萤石云开放平台API
    axios.post(
      buildApiUrl(YS7_CONFIG.ENDPOINTS.TOKEN),
      {
        appKey,
        appSecret,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    .then((response: any) => {
      if (response.data.code === '200') {
        console.log('直接调用萤石云API获取Token成功');
        resolve(response.data.data);
      } else {
        const errorMsg = getErrorMessage(response.data.code);
        console.error('获取AccessToken失败:', errorMsg);
        reject(new Error(errorMsg));
      }
    })
    .catch((error) => {
      console.error('直接调用萤石云API失败，尝试使用代理:', error);
      
      // 方式2：如果直接调用失败（可能是CORS问题），回退到后端代理
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
            console.log('通过后端代理获取Token成功');
            resolve(res.data);
          } else {
            reject(new Error(res.msg || '后端代理获取Token失败'));
          }
        })
        .catch((e) => {
          console.error('后端代理也失败:', e);
          reject(new Error('获取AccessToken失败，请检查网络连接和配置'));
        });
    });
  });
};
