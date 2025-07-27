'use client';
import Layout from '@/components/Layout';
import { 
  Select, 
  Space, 
  Card, 
  Button, 
  message, 
  DatePicker, 
  Table, 
  Modal, 
  Tag,
  Radio,
  Tooltip,
  Alert
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { 
  getAccessToken, 
  getCloudRecordList, 
  getLocalRecordList, 
  getVideoByTime,
  getPlaybackUrl 
} from '../../[warehouseID]/api';
import { YS7_CONFIG, validateConfig, validateTimeRange } from '../../config';
import EZUIKit from 'ezuikit-js';
import { useParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { warehouseInfo } from '../../../store';
import { useResponsive } from '@/hooks/useResponsive';
import { 
  PlayCircleOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  CloudOutlined,
  HddOutlined,
  CalendarOutlined,
  WarningOutlined,
  BugOutlined
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

// 导入测试工具（仅在开发环境）
if (process.env.NODE_ENV === 'development') {
  import('../../test-api');
}

const { RangePicker } = DatePicker;

interface RecordItem {
  startTime: string;
  endTime: string;
  fileSize?: number;
  duration?: number;
  source: 1 | 2; // 1-云存储，2-本地存储
  recType?: number;
  localType?: string;
  fileId?: string;
  fileIndex?: string;
}

export default function PlaybackSurveillance() {
  const [curWarehouseInfo] = useAtom(warehouseInfo);
  const [accessToken, setAccessToken] = useState<string>();
  const [cameraType, setCameraType] = useState<'lCameraId' | 'rCameraId'>('lCameraId');
  const [cameraID, setCameraID] = useState<string>('');
  const [channelNo, setChannelNo] = useState<number>(YS7_CONFIG.DEFAULTS.CHANNEL_NO);
  const [loading, setLoading] = useState<boolean>(false);
  const [recordList, setRecordList] = useState<RecordItem[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [playbackVisible, setPlaybackVisible] = useState<boolean>(false);
  const [storageType, setStorageType] = useState<1 | 2>(1); // 1-云存储，2-本地存储
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [timeRangeError, setTimeRangeError] = useState<string>('');
  const [recordType, setRecordType] = useState<number | undefined>(undefined);

  const playerRef = useRef<EZUIKit | null>(null);
  const { isMobile } = useResponsive();

  // 格式化时间为萤石云API需要的格式
  const formatTimeForAPI = (date: Dayjs | Date) => {
    let targetDate: Date;

    if (date && typeof date === 'object' && 'toDate' in date) {
      // 如果是 Dayjs 对象
      targetDate = date.toDate();
    } else if (date instanceof Date) {
      // 如果是 Date 对象
      targetDate = date;
    } else {
      // 如果是其他类型，创建新的 Date 对象
      targetDate = new Date(date);
    }

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    const seconds = String(targetDate.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 验证时间范围
  const validateDateRange = (range: [Dayjs, Dayjs] | null, storage: 1 | 2): boolean => {
    if (!range || !range[0] || !range[1]) {
      setTimeRangeError('请选择时间范围');
      return false;
    }

    const startDate = range[0].toDate();
    const endDate = range[1].toDate();

    const validation = validateTimeRange(startDate, endDate, storage);
    if (!validation.valid) {
      setTimeRangeError(validation.message || '时间范围无效');
      return false;
    }

    setTimeRangeError('');
    return true;
  };

  // 处理存储类型变化
  const handleStorageTypeChange = (type: 1 | 2) => {
    setStorageType(type);

    // 如果切换到本地存储，自动调整时间范围为当天
    if (type === 2 && dateRange) {
      setDateRange(null);
      message.info('已切换到本地存储，请重新选择时间范围（必须在同一天内）');
    }

    // 验证当前时间范围
    validateDateRange(dateRange, type);
  };

  // 处理时间范围变化
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates) {
      validateDateRange(dates, storageType);
    } else {
      setTimeRangeError('');
    }
  };

  // 搜索录像列表
  const searchRecords = async () => {
    if (!cameraID || !accessToken) {
      message.warning('请确保摄像头已选择且访问令牌有效');
      return;
    }

    if (!validateDateRange(dateRange, storageType)) {
      return;
    }

    setLoading(true);
    try {
      const startDate = dateRange![0].toDate();
      const endDate = dateRange![1].toDate();

      console.log('🔍 搜索录像参数:', {
        cameraID,
        channelNo,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        storageType: storageType === 1 ? '云存储' : '本地存储',
        recordType,
        apiType: storageType === 2 ? 'v3 本地录像API' : 'lapp/video/by/time API'
      });

      let response;
      if (storageType === 2) {
        // 本地录像 - 使用v3 API，参数放在Header中
        console.log('📡 调用本地录像API (v3)，参数放在Header中');
        response = await getLocalRecordList(
          accessToken, 
          cameraID, 
          channelNo.toString(), 
          startDate, 
          endDate,
          recordType
        );
      } else {
        // 云存储录像 - 使用 getVideoByTime 接口
        console.log('📡 调用云存储录像API (lapp/video/by/time)');
        response = await getVideoByTime(
          accessToken,
          cameraID,
          channelNo,
          startDate,
          endDate,
          YS7_CONFIG.REC_TYPES.CLOUD
        );
      }

      console.log('📋 录像查询响应:', response);

      if (response.code === '200' && response.data) {
        const records = response.data.map((item: any) => ({
          startTime: item.startTime,
          endTime: item.endTime,
          fileSize: item.fileSize,
          duration: item.duration,
          source: storageType,
          recType: item.recType,
          localType: item.localType,
          fileId: item.fileId,
          fileIndex: item.fileIndex,
        }));
        setRecordList(records);
        message.success(`找到 ${records.length} 条录像记录`);

        if (response.hasMore) {
          message.info('还有更多录像记录，可以调整时间范围进行分页查询');
        }
      } else {
        setRecordList([]);
        message.info('未找到录像记录');
      }
    } catch (error) {
      console.error('❌ 搜索录像失败:', error);
      message.error(`搜索录像失败: ${(error as Error)?.message || '未知错误'}`);
      setRecordList([]);
    } finally {
      setLoading(false);
    }
  };

  // 播放录像
  const playRecord = async (record: RecordItem) => {
    if (!accessToken) {
      message.error('访问令牌无效');
      return;
    }

    if (!cameraID) {
      message.error('摄像头ID无效');
      return;
    }

    try {
      setSelectedRecord(record);
      setPlaybackVisible(true);

      console.log('🎬 播放录像参数:', {
        cameraID,
        channelNo,
        startTime: record.startTime,
        endTime: record.endTime,
        source: record.source,
        storageType: record.source === 1 ? '云存储' : '本地存储'
      });

      // 获取回放地址
      const response = await getPlaybackUrl(
        accessToken,
        cameraID,
        channelNo,
        record.startTime,
        record.endTime,
        record.source
      );

      console.log('🎥 回放地址响应:', response);

      if (response.code === '200' && response.data?.url) {
        // 销毁之前的播放器
        if (playerRef.current) {
          try {
            playerRef.current.stop();
          } catch (e) {
            console.warn('停止之前的播放器时出现警告:', e);
          }
          playerRef.current = null;
        }

        // 等待DOM更新
        setTimeout(() => {
          try {
            // 根据设备类型选择模板
            const template = isMobile ? 'mobileRec' : 'pcRec';
            
            console.log('🎮 播放器配置:', {
              template,
              isMobile,
              url: response.data.url
            });

            // 创建回放播放器
            playerRef.current = new EZUIKit.EZUIKitPlayer({
              id: 'ezuikit-playback-player',
              url: response.data.url,
              accessToken,
              useHardDev: YS7_CONFIG.PLAYER.USE_HARD_DEV,
              height: isMobile ? 250 : 400,
              width: isMobile ? window.innerWidth * 0.85 : 600, // 移动端使用屏幕宽度的85%
              template,
              autoplay: YS7_CONFIG.PLAYER.AUTO_PLAY,
              // 添加错误处理
              error: (err: any) => {
                console.error('播放器错误:', err);
                message.error('播放器初始化失败');
              },
              success: () => {
                console.log('✅ 播放器初始化成功');
                message.success('开始播放录像');
              }
            });
          } catch (playerError) {
            console.error('❌ 创建播放器失败:', playerError);
            message.error('创建播放器失败，请检查播放地址是否有效');
          }
        }, 100);
      } else {
        console.error('回放地址响应异常:', response);
        message.error('获取回放地址失败，请检查录像是否存在');
        setPlaybackVisible(false);
      }
    } catch (error) {
      console.error('❌ 播放录像失败:', error);
      message.error(`播放录像失败: ${(error as Error)?.message || '未知错误'}`);
      setPlaybackVisible(false);
    }
  };

  // 初始化访问令牌
  const initAccessToken = async () => {
    if (!validateConfig()) {
      message.error('萤石云配置错误，请检查APP_KEY和APP_SECRET');
      return;
    }

    try {
      const res = await getAccessToken();
      setAccessToken(res?.accessToken || '');
      message.success('获取访问令牌成功');
    } catch (error) {
      console.error('获取访问令牌失败:', error);
      message.error(`获取访问令牌失败: ${(error as Error)?.message || '未知错误'}`);
    }
  };

  // 调试功能 - 仅在开发环境显示
  const showDebugInfo = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 调试信息:');
      console.log('当前配置:', {
        cameraID,
        channelNo,
        storageType,
        accessToken: accessToken ? accessToken.substring(0, 20) + '...' : '无',
        dateRange: dateRange ? [dateRange[0].format(), dateRange[1].format()] : '未选择'
      });
      console.log('使用 window.testYS7API 进行API测试');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration: number) => {
        if (!duration) return '-';
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      },
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 120,
      render: (size: number) => {
        if (!size) return '-';
        if (size < 1024) return `${size}B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
        return `${(size / (1024 * 1024)).toFixed(1)}MB`;
      },
    },
    {
      title: '录像类型',
      dataIndex: 'localType',
      key: 'localType',
      width: 100,
      render: (localType: string) => {
        const typeMap: { [key: string]: string } = {
          'TIMING': '定时录像',
          'ALARM': '事件录像',
          'ALLEVENT': '所有事件',
        };
        return localType ? typeMap[localType] || localType : '-';
      },
    },
    {
      title: '存储类型',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: 1 | 2) => (
        <Tag color={source === 1 ? 'blue' : 'green'} icon={source === 1 ? <CloudOutlined /> : <HddOutlined />}>
          {source === 1 ? '云存储' : '本地存储'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: RecordItem) => (
        <Button
          type="primary"
          size="small"
          icon={<PlayCircleOutlined />}
          onClick={() => playRecord(record)}
        >
          播放
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (curWarehouseInfo) {
      setCameraID(curWarehouseInfo?.[cameraType]);
    }
  }, [curWarehouseInfo, cameraType]);

  useEffect(() => {
    initAccessToken();
    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current = null;
      }
    };
  }, []);

  const canSearch = dateRange && dateRange[0] && dateRange[1] && !timeRangeError && accessToken && cameraID;

  return (
    <Layout curActive="/surveillance/playback/:warehouseID">
      <div style={{ padding: '20px' }}>
        <Card title="录像回放" style={{ marginBottom: '20px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* 搜索控制面板 */}
            <Card size="small" title="搜索条件">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space wrap>
                  <div>
                    <label>摄像头：</label>
                    <Select
                      style={{ width: 120 }}
                      options={[
                        { label: '仓库外摄像头', value: 'lCameraId' },
                        { label: '仓库内摄像头', value: 'rCameraId' },
                      ]}
                      onChange={(value) => setCameraType(value)}
                      value={cameraType}
                    />
                  </div>
                  <div>
                    <label>通道：</label>
                    <Select
                      style={{ width: 100 }}
                      options={[
                        { label: '通道一', value: 1 },
                        { label: '通道二', value: 2 },
                      ]}
                      onChange={(value) => setChannelNo(value)}
                      value={channelNo}
                    />
                  </div>
                  <div>
                    <label>存储类型：</label>
                    <Radio.Group
                      value={storageType}
                      onChange={(e) => handleStorageTypeChange(e.target.value)}
                    >
                      <Radio.Button value={1}>
                        <CloudOutlined /> 云存储
                      </Radio.Button>
                      <Radio.Button value={2}>
                        <HddOutlined /> 本地存储
                      </Radio.Button>
                    </Radio.Group>
                  </div>
                  {storageType === 2 && (
                    <div>
                      <label>录像类型：</label>
                      <Select
                        style={{ width: 120 }}
                        placeholder="选择录像类型"
                        allowClear
                        value={recordType}
                        onChange={setRecordType}
                        options={[
                          { label: '所有类型', value: undefined },
                          { label: '定时录像', value: YS7_CONFIG.RECORD_TYPES.TIMING },
                          { label: '事件录像', value: YS7_CONFIG.RECORD_TYPES.EVENT },
                          { label: '智能-车', value: YS7_CONFIG.RECORD_TYPES.SMART_CAR },
                          { label: '智能-人形', value: YS7_CONFIG.RECORD_TYPES.SMART_PERSON },
                          { label: '自动浓缩', value: YS7_CONFIG.RECORD_TYPES.AUTO_COMPRESS },
                        ]}
                      />
                    </div>
                  )}
                </Space>

                <Space wrap>
                  <div>
                    <label>时间范围：</label>
                    <RangePicker
                      showTime
                      value={dateRange}
                      onChange={handleDateRangeChange}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder={['开始时间', '结束时间']}
                      status={timeRangeError ? 'error' : ''}
                    />
                  </div>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={searchRecords}
                    loading={loading}
                    disabled={!canSearch}
                  >
                    搜索录像
                  </Button>
                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      icon={<BugOutlined />}
                      onClick={showDebugInfo}
                      size="small"
                    >
                      调试
                    </Button>
                  )}
                </Space>

                {/* API使用说明 */}
                <Alert
                  message="API使用说明"
                  description={
                    <div>
                      <div>• <strong>本地录像</strong>：使用v3 API，accessToken/deviceSerial/localIndex放在Header中，时间戳为秒，必须同一天</div>
                      <div>• <strong>云存储录像</strong>：使用lapp/video/by/time API，参数放在Body中，时间戳为毫秒，最多30天</div>
                    </div>
                  }
                  type="info"
                  showIcon
                  style={{ fontSize: '12px' }}
                />

                {/* 时间范围提示和错误信息 */}
                {storageType === 2 && (
                  <Alert
                    message="本地录像查询限制"
                    description="本地录像查询的开始时间和结束时间必须在同一天内，且开始时间不能大于结束时间。"
                    type="info"
                    showIcon
                    icon={<WarningOutlined />}
                  />
                )}

                {timeRangeError && (
                  <Alert
                    message="时间范围错误"
                    description={timeRangeError}
                    type="error"
                    showIcon
                  />
                )}
              </Space>
            </Card>

            {/* 录像列表 */}
            <Card 
              size="small" 
              title={`录像列表 (${recordList.length} 条)`}
              extra={
                <Tooltip title="刷新列表">
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={searchRecords}
                    loading={loading}
                    disabled={!canSearch}
                  />
                </Tooltip>
              }
            >
              <Table
                columns={columns}
                dataSource={recordList}
                rowKey={(record) => `${record.startTime}-${record.endTime}`}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
                scroll={{ x: 900 }}
                size="small"
              />
            </Card>

            {/* 状态信息 */}
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              fontSize: '12px',
              color: '#666'
            }}>
              <Space>
                <span>摄像头: {cameraType === 'lCameraId' ? '仓库外摄像头' : '仓库内摄像头'}</span>
                <span>通道: {channelNo}</span>
                <span>存储类型: {storageType === 1 ? '云存储' : '本地存储'}</span>
                <span>API类型: {storageType === 2 ? 'v3 本地录像API' : 'lapp/video/by/time API'}</span>
                <span>设备ID: {cameraID || '未选择'}</span>
                <span>Token状态: {accessToken ? '有效' : '无效'}</span>
              </Space>
            </div>
          </Space>
        </Card>

        {/* 录像播放弹窗 */}
        <Modal
          title={`录像回放 - ${selectedRecord?.startTime} 至 ${selectedRecord?.endTime}`}
          open={playbackVisible}
          onCancel={() => {
            setPlaybackVisible(false);
            if (playerRef.current) {
              playerRef.current.stop();
              playerRef.current = null;
            }
          }}
          footer={null}
          width={isMobile ? '95%' : 650}
          destroyOnClose
          centered={isMobile}
        >
          <div style={{ 
            backgroundColor: '#000', 
            borderRadius: '4px',
            padding: '10px',
            minHeight: isMobile ? '300px' : '420px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div id="ezuikit-playback-player" style={{ width: '100%', height: '100%' }}></div>
          </div>
          {selectedRecord && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <Space wrap>
                <span>开始时间: {selectedRecord.startTime}</span>
                <span>结束时间: {selectedRecord.endTime}</span>
                <span>存储类型: {selectedRecord.source === 1 ? '云存储' : '本地存储'}</span>
                {selectedRecord.localType && <span>录像类型: {selectedRecord.localType}</span>}
                <span>模板: {isMobile ? 'mobileRec' : 'pcRec'}</span>
              </Space>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
