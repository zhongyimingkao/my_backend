# 视频监控系统

视频监控系统已经分离为两个独立的页面：现场监控和录像回放。

## 页面结构

#### 3. 查询设备本地录像（v3 API）
```javascript
GET /api/v3/device/local/video/unify/query
Headers: {
  accessToken: string,    // 萤石开放平台令牌
  deviceSerial: string,   // 设备序列号
  localIndex: string      // 通道号
}
Query Parameters: {
  startTime: number,      // 开始时间戳（秒）
  endTime: number,        // 结束时间戳（秒）
  recordType?: number,    // 录像类型：1-定时，2-事件，3-智能车，4-智能人形，5-自动浓缩
  isQueryByNvr?: number,  // 是否反查NVR录像：0-不反查(默认)，1-反查NVR
  location?: number,      // 录像检索位置：1-本地录像检索(默认)，2-CVR中心录像检索
  pageSize?: number       // 分页大小，默认50，最大200
}

// 重要：accessToken、deviceSerial、localIndex 必须放在Header中
// 时间参数必须是时间戳格式（秒），且开始结束时间必须在同一天
```
