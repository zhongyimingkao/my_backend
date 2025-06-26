'use client';
import Layout from '@/components/Layout';
import { Select, Space, Card, Button, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { getAccessToken, getVideoUrl } from '../../[warehouseID]/api';
import { YS7_CONFIG, validateConfig } from '../../config';
import EZUIKit from 'ezuikit-js';
import Image from 'next/image';
import styles from '../../[warehouseID]/page.module.css';
import { useParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { warehouseInfo } from '../../../store';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';

export default function LiveSurveillance() {
  const [curWarehouseInfo] = useAtom(warehouseInfo);
  const [accessToken, setAccessToken] = useState<string>();
  const [canPlay, setCanPlay] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [cameraType, setCameraType] = useState<'lCameraId' | 'rCameraId'>('lCameraId');
  const [cameraID, setCameraID] = useState<string>('');
  const [channelNo, setChannelNo] = useState<number>(YS7_CONFIG.DEFAULTS.CHANNEL_NO);
  const [loading, setLoading] = useState<boolean>(false);

  const playerRef = useRef<EZUIKit | null>(null);

  const initPlayer = async () => {
    if (!cameraID || !accessToken) return;
    
    setLoading(true);
    try {
      const videoData = await getVideoUrl(accessToken, cameraID, channelNo, YS7_CONFIG.DEFAULTS.LIVE_TYPE);
      const url = videoData?.data?.data?.url || '';
      
      if (!url) {
        message.error('获取视频流失败');
        return;
      }

      // 销毁之前的播放器
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current = null;
      }

      // 创建新的播放器
      playerRef.current = new EZUIKit.EZUIKitPlayer({
        id: 'ezuikit-live-player',
        url,
        accessToken,
        useHardDev: YS7_CONFIG.PLAYER.USE_HARD_DEV,
        height: document.documentElement.clientHeight - 250,
        width: document.documentElement.clientWidth - 320,
        template: YS7_CONFIG.PLAYER.LIVE_TEMPLATE,
        autoplay: YS7_CONFIG.PLAYER.AUTO_PLAY,
      });

      setCanPlay(true);
      setIsPlaying(true);
      message.success('视频流加载成功');
    } catch (error) {
      console.error('初始化播放器失败:', error);
      message.error(`初始化播放器失败: ${(error as Error)?.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (playerRef.current) {
      playerRef.current.play();
      setIsPlaying(true);
    } else {
      initPlayer();
    }
  };

  const handlePause = () => {
    if (playerRef.current) {
      playerRef.current.stop();
      setIsPlaying(false);
    }
  };

  const handleRefresh = () => {
    initPlayer();
  };

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

  useEffect(() => {
    if (cameraID && accessToken) {
      initPlayer();
    }
  }, [cameraID, accessToken, channelNo]);

  return (
    <Layout curActive="/surveillance/live/:warehouseID">
      <div style={{ padding: '20px' }}>
        <Card title="现场监控" style={{ marginBottom: '20px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* 控制面板 */}
            <div className={styles.pageSelector}>
              <Space size="large">
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
                <Space>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handlePlay}
                    loading={loading}
                    disabled={isPlaying}
                  >
                    播放
                  </Button>
                  <Button
                    icon={<PauseCircleOutlined />}
                    onClick={handlePause}
                    disabled={!isPlaying}
                  >
                    暂停
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={loading}
                  >
                    刷新
                  </Button>
                </Space>
              </Space>
            </div>

            {/* 视频播放区域 */}
            <div style={{ 
              border: '1px solid #d9d9d9', 
              borderRadius: '6px', 
              padding: '10px',
              backgroundColor: '#000',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div id="ezuikit-live-player"></div>
              {!canPlay && (
                <div style={{ textAlign: 'center', color: '#fff' }}>
                  <Image
                    src="/noVideo.png"
                    width={200}
                    height={200}
                    alt="无视频信号"
                  />
                  <div style={{ marginTop: '10px' }}>
                    {loading ? '正在加载视频流...' : '暂无视频信号'}
                  </div>
                </div>
              )}
            </div>

            {/* 状态信息 */}
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              fontSize: '12px',
              color: '#666'
            }}>
              <Space>
                <span>状态: {isPlaying ? '播放中' : '已停止'}</span>
                <span>摄像头: {cameraType === 'lCameraId' ? '仓库内摄像头' : '仓库外摄像头'}</span>
                <span>通道: {channelNo}</span>
                <span>设备ID: {cameraID || '未选择'}</span>
                <span>Token状态: {accessToken ? '有效' : '无效'}</span>
              </Space>
            </div>
          </Space>
        </Card>
      </div>
    </Layout>
  );
}