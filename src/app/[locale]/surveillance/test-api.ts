// 测试萤石云API调用的工具函数
import { getLocalRecordList, getVideoByTime, getAccessToken } from './[warehouseID]/api';
import { YS7_CONFIG } from './config';

// 测试本地录像查询API
export const testLocalRecordAPI = async () => {
  try {
    console.log('开始测试本地录像查询API...');
    
    // 1. 获取AccessToken
    const tokenRes = await getAccessToken();
    const accessToken = tokenRes.accessToken;
    console.log('✅ AccessToken获取成功:', accessToken.substring(0, 20) + '...');
    
    // 2. 设置测试参数
    const deviceSerial = 'YOUR_DEVICE_SERIAL'; // 替换为实际设备序列号
    const localIndex = '1'; // 通道号
    
    // 3. 设置今天的时间范围
    const today = new Date();
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    console.log('📅 查询时间范围:', {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      deviceSerial,
      localIndex
    });
    
    // 4. 调用本地录像查询API
    const result = await getLocalRecordList(
      accessToken,
      deviceSerial,
      localIndex,
      startTime,
      endTime,
      undefined, // 查询所有类型
      10 // 限制返回10条
    );
    
    console.log('✅ 本地录像查询成功:', result);
    return result;
    
  } catch (error) {
    console.error('❌ 本地录像查询失败:', error);
    throw error;
  }
};

// 测试云存储录像查询API
export const testCloudRecordAPI = async () => {
  try {
    console.log('开始测试云存储录像查询API...');
    
    // 1. 获取AccessToken
    const tokenRes = await getAccessToken();
    const accessToken = tokenRes.accessToken;
    console.log('✅ AccessToken获取成功:', accessToken.substring(0, 20) + '...');
    
    // 2. 设置测试参数
    const deviceSerial = 'YOUR_DEVICE_SERIAL'; // 替换为实际设备序列号
    const channelNo = 1;
    
    // 3. 设置最近3天的时间范围
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    console.log('📅 查询时间范围:', {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      deviceSerial,
      channelNo
    });
    
    // 4. 调用云存储录像查询API
    const result = await getVideoByTime(
      accessToken,
      deviceSerial,
      channelNo,
      startTime,
      endTime,
      YS7_CONFIG.REC_TYPES.CLOUD,
      10 // 限制返回10条
    );
    
    console.log('✅ 云存储录像查询成功:', result);
    return result;
    
  } catch (error) {
    console.error('❌ 云存储录像查询失败:', error);
    throw error;
  }
};

// 验证API请求格式
export const validateAPIRequest = () => {
  console.log('📋 API请求格式验证:');
  
  console.log('1. 本地录像查询 (v3 API):');
  console.log('   URL: GET https://open.ys7.com/api/v3/device/local/video/unify/query');
  console.log('   Headers: {');
  console.log('     accessToken: "your_access_token",');
  console.log('     deviceSerial: "your_device_serial",');
  console.log('     localIndex: "1"');
  console.log('   }');
  console.log('   Query: startTime=1234567890&endTime=1234567890&pageSize=50');
  console.log('');
  
  console.log('2. 云存储录像查询:');
  console.log('   URL: POST https://open.ys7.com/api/lapp/video/by/time');
  console.log('   Headers: { Content-Type: "application/x-www-form-urlencoded" }');
  console.log('   Body: accessToken=xxx&deviceSerial=xxx&channelNo=1&startTime=1234567890000&endTime=1234567890000&recType=1&version=2.0');
  console.log('');
  
  console.log('⚠️  注意事项:');
  console.log('   - 本地录像: 时间戳使用秒，必须同一天，主要参数放Header');
  console.log('   - 云存储录像: 时间戳使用毫秒，最多30天，参数放Body');
  console.log('   - 确保设备序列号和通道号正确');
  console.log('   - AccessToken有效期7天，注意缓存');
};

// 在浏览器控制台中使用的测试函数
if (typeof window !== 'undefined') {
  (window as any).testYS7API = {
    testLocal: testLocalRecordAPI,
    testCloud: testCloudRecordAPI,
    validate: validateAPIRequest,
  };
  
  console.log('🔧 萤石云API测试工具已加载到 window.testYS7API');
  console.log('使用方法:');
  console.log('  window.testYS7API.validate() - 查看API格式');
  console.log('  window.testYS7API.testLocal() - 测试本地录像API');
  console.log('  window.testYS7API.testCloud() - 测试云存储API');
}