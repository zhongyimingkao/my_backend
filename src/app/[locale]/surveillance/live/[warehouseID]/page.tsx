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
import { useResponsive } from '@/hooks/useResponsive';
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
  const { isMobile } = useResponsive();

  // 获取当前应该使用的模板
  const getCurrentTemplate = () => {
    return isMobile ? 'mobileLive' : 'pcLive';
  };

  const initPlayer = async () => {
    if (!cameraID || !accessToken) return;
    
    setLoading(true);
    try {
      console.log('🎥 初始化直播播放器:', {
        cameraID,
        channelNo,
        template: getCurrentTemplate(),
        isMobile
      });

      const videoData = await getVideoUrl(accessToken, cameraID, channelNo, YS7_CONFIG.DEFAULTS.LIVE_TYPE);
      const url = videoData?.data?.data?.url || '';
      
      if (!url) {
        console.error('❌ 获取视频URL失败');
        message.error('获取视频流失败');
        return;
      }

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
          // 创建播放器配置
          let playerHeight, playerWidth;
          
          if (isMobile) {
            // 移动端强制横屏比例 (16:9)
            const maxWidth = Math.min(window.innerWidth - 60, 300);
            playerWidth = maxWidth;
            playerHeight = Math.round(maxWidth * 9 / 16); // 16:9比例
          } else {
            // PC端保持原有设置
            playerHeight = Math.min(document.documentElement.clientHeight - 300, 500);
            playerWidth = Math.min(document.documentElement.clientWidth - 400, 800);
          }

          const playerConfig: any = {
            id: 'ezuikit-live-player',
            url,
            accessToken,
            useHardDev: YS7_CONFIG.PLAYER.USE_HARD_DEV,
            height: playerHeight,
            width: playerWidth,
            autoplay: YS7_CONFIG.PLAYER.AUTO_PLAY,
          };

          // 只有在模板不为空时才添加template属性
          const template = getCurrentTemplate();
          if (template) {
            playerConfig.template = template;
          }

          console.log('🎮 播放器配置:', {
            ...playerConfig,
            计算尺寸: `${playerWidth}x${playerHeight}`,
            屏幕宽度: window.innerWidth,
            是否移动端: isMobile
          });

          // 创建新的播放器
          playerRef.current = new EZUIKit.EZUIKitPlayer(playerConfig);

          setCanPlay(true);
          setIsPlaying(true);
          message.success('视频流加载成功');
        } catch (playerError) {
          console.error('❌ 创建播放器失败:', playerError);
          message.error('创建播放器失败，请检查播放地址是否有效');
        }
      }, 100);
    } catch (error) {
      console.error('❌ 初始化播放器失败:', error);
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

  // 当响应式状态改变时，重新创建播放器
  useEffect(() => {
    if (cameraID && accessToken && canPlay) {
      initPlayer();
    }
  }, [isMobile]);

  return (
    <Layout curActive="/surveillance/live/:warehouseID">
      <div style={{ padding: '20px' }}>
        <Card title="现场监控" style={{ marginBottom: '20px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* 控制面板 */}
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '12px' : '20px',
              alignItems: isMobile ? 'stretch' : 'center',
              marginBottom: '20px',
              padding: isMobile ? '16px' : '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center', 
                gap: isMobile ? '8px' : '10px',
                flex: isMobile ? 'none' : 1
              }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: '#495057',
                  minWidth: isMobile ? 'auto' : '80px'
                }}>
                  摄像头：
                </span>
                <Select
                  style={{ width: isMobile ? '100%' : 140 }}
                  size={isMobile ? 'large' : 'middle'}
                  options={[
                    { label: '仓库外摄像头', value: 'lCameraId' },
                    { label: '仓库内摄像头', value: 'rCameraId' },
                  ]}
                  onChange={(value) => setCameraType(value)}
                  value={cameraType}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center', 
                gap: isMobile ? '8px' : '10px',
                flex: isMobile ? 'none' : 1
              }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: '#495057',
                  minWidth: isMobile ? 'auto' : '60px'
                }}>
                  通道：
                </span>
                <Select
                  style={{ width: isMobile ? '100%' : 100 }}
                  size={isMobile ? 'large' : 'middle'}
                  options={[
                    { label: '通道一', value: 1 },
                    { label: '通道二', value: 2 },
                  ]}
                  onChange={(value) => setChannelNo(value)}
                  value={channelNo}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '8px' : '10px',
                flex: isMobile ? 'none' : 1
              }}>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handlePlay}
                  loading={loading}
                  disabled={isPlaying}
                  size={isMobile ? 'large' : 'middle'}
                  style={{ flex: isMobile ? 1 : 'none' }}
                >
                  播放
                </Button>
                <Button
                  icon={<PauseCircleOutlined />}
                  onClick={handlePause}
                  disabled={!isPlaying}
                  size={isMobile ? 'large' : 'middle'}
                  style={{ flex: isMobile ? 1 : 'none' }}
                >
                  暂停
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                  size={isMobile ? 'large' : 'middle'}
                  style={{ flex: isMobile ? 1 : 'none' }}
                >
                  刷新
                </Button>
              </div>
            </div>

            {/* 视频播放区域 */}
            <div style={ isMobile?{}:{ 
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
              <Space wrap>
                <span>状态: {isPlaying ? '播放中' : '已停止'}</span>
                <span>摄像头: {cameraType === 'lCameraId' ? '仓库外摄像头' : '仓库内摄像头'}</span>
                <span>通道: {channelNo}</span>
                <span>模板: {getCurrentTemplate()}</span>
                <span>设备: {isMobile ? '移动端' : 'PC端'}</span>
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
