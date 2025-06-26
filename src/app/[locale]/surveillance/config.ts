// 萤石云配置
export const YS7_CONFIG = {
  // 萤石云AppKey和AppSecret
  // 注意：在生产环境中，这些敏感信息应该通过环境变量或后端API获取
  APP_KEY: process.env.NEXT_PUBLIC_YS7_APP_KEY || '8cc3be2e5b0a4d99b84baca5ebc44872',
  APP_SECRET: process.env.NEXT_PUBLIC_YS7_APP_SECRET || 'e2201d7f6ac670816355011b664b4627',
  
  // API端点
  BASE_URL: 'https://open.ys7.com/api',
  
  // API路径
  ENDPOINTS: {
    TOKEN: '/lapp/token/get',
    LIVE_ADDRESS: '/lapp/v2/live/address/get',
    // 新的正确的录像查询接口
    LOCAL_RECORD_QUERY: '/v3/device/local/video/unify/query', // 本地录像查询
    VIDEO_BY_TIME: '/lapp/video/by/time', // 根据时间获取存储文件信息（云存储+本地）
    PLAYBACK_ADDRESS: '/lapp/v2/video/rec/address/get',
  },
  
  // 默认参数
  DEFAULTS: {
    CHANNEL_NO: 1,
    QUALITY: 1, // 1-高清，2-标清
    LIVE_TYPE: 1, // 1-直播，2-回放
    PAGE_SIZE: 50, // 分页大小
  },
  
  // 播放器配置
  PLAYER: {
    LIVE_TEMPLATE: 'pcLive',
    PLAYBACK_TEMPLATE: 'pcRec',
    USE_HARD_DEV: true,
    AUTO_PLAY: true,
  },
  
  // 录像类型
  RECORD_TYPES: {
    ALL: 0, // 查询所有类型
    TIMING: 1, // 定时录像
    EVENT: 2, // 事件录像
    SMART_CAR: 3, // 智能-车
    SMART_PERSON: 4, // 智能-人形
    AUTO_COMPRESS: 5, // 自动浓缩录像
  },
  
  // 回放源类型
  REC_TYPES: {
    AUTO: 0, // 系统自动选择
    CLOUD: 1, // 云存储
    LOCAL: 2, // 本地录像
  },
  
  // 时间限制配置
  TIME_LIMITS: {
    LOCAL_RECORD_MAX_DAYS: 1, // 本地录像查询最大天数（必须同一天）
    CLOUD_RECORD_MAX_DAYS: 30, // 云存储录像查询最大天数
  },
  
  // 错误码映射
  ERROR_CODES: {
    '200': '成功',
    '10001': '参数错误',
    '10002': 'accessToken过期或异常',
    '10004': '用户不存在',
    '10005': 'appKey异常',
    '10011': '未开通萤石服务',
    '10013': '非开发者账号无权限调用',
    '10030': 'appkey和appsecret不匹配',
    '20002': '设备不存在',
    '20014': 'deviceSerial不合法',
    '20032': '该用户下通道不存在',
    '40110002': 'accessToken过期或异常',
    '40420002': '设备不存在',
    '40820006': '网络异常',
    '41220007': '设备不在线',
    '40820008': '设备响应超时',
    '41220015': '设备不支持该录像类型',
    '40310031': '账号无权限访问此设备',
    '50050000': '服务异常',
    '60024': '取消订阅操作失败',
    '49999': '操作异常',
  },
};

// 获取错误信息
export const getErrorMessage = (code: string): string => {
  return YS7_CONFIG.ERROR_CODES[code] || `未知错误 (${code})`;
};

// 构建完整的API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${YS7_CONFIG.BASE_URL}${endpoint}`;
};

// 验证配置
export const validateConfig = (): boolean => {
  if (!YS7_CONFIG.APP_KEY || !YS7_CONFIG.APP_SECRET) {
    console.error('萤石云配置错误：缺少APP_KEY或APP_SECRET');
    return false;
  }
  return true;
};

// 验证时间范围 - 本地录像必须在同一天
export const validateTimeRange = (startTime: Date, endTime: Date, storageType: 1 | 2): { valid: boolean; message?: string } => {
  const diffTime = Math.abs(endTime.getTime() - startTime.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (storageType === 2) {
    // 本地录像：必须在同一天
    const startDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
    const endDate = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate());
    
    if (startDate.getTime() !== endDate.getTime()) {
      return {
        valid: false,
        message: '本地录像查询的开始时间和结束时间必须在同一天'
      };
    }
    
    if (startTime.getTime() >= endTime.getTime()) {
      return {
        valid: false,
        message: '开始时间不能大于或等于结束时间'
      };
    }
  } else {
    // 云存储录像：最多查询30天
    if (diffDays > YS7_CONFIG.TIME_LIMITS.CLOUD_RECORD_MAX_DAYS) {
      return {
        valid: false,
        message: `云存储录像查询时间范围不能超过${YS7_CONFIG.TIME_LIMITS.CLOUD_RECORD_MAX_DAYS}天`
      };
    }
  }
  
  return { valid: true };
};

// 时间戳转换工具
export const timeUtils = {
  // Date对象转换为时间戳（秒）
  dateToTimestamp: (date: Date): number => {
    return Math.floor(date.getTime() / 1000);
  },
  
  // 时间戳（秒）转换为Date对象
  timestampToDate: (timestamp: number): Date => {
    return new Date(timestamp * 1000);
  },
  
  // Date对象转换为萤石云API格式的字符串
  dateToApiString: (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },
};