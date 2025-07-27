'use client';
import Layout from '@/components/Layout';
import { Select, Space, Tabs } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAccessToken, getVideoUrl } from './api';
import { YS7_CONFIG } from '../config';
import EZUIKit from 'ezuikit-js';
import Image from 'next/image';
import styles from './page.module.css';
import { queryWareHouse } from '../../user/api';
import { useParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { warehouseInfo } from '../../store';
import { useResponsive } from '@/hooks/useResponsive';

export default function Surveillance() {
  const [curWarehouseInfo] = useAtom(warehouseInfo);
  const [accessToken, setAccessToken] = useState<string>();
  const [canPlay, setCanPlay] = useState<boolean>(false);
  const [cameraType, setCameraType] = useState<'lCameraId' | 'rCameraId'>('lCameraId');
  const [cameraID, setCameraID] = useState<string>('');
  const [channelNo, setChannelNo] = useState<number>(YS7_CONFIG.DEFAULTS.CHANNEL_NO);
  const [isLive, setIsLive] = useState<boolean>(true); // true-直播，false-回放

  const playerRef = useRef<EZUIKit | null>(null);
  const { isMobile } = useResponsive();

  // 获取当前应该使用的模板
  const getCurrentTemplate = () => {
    if (isLive) {
      return isMobile ? 'mobileLive' : 'pcLive';
    } else {
      return isMobile ? 'mobileRec' : 'pcRec';
    }
  };

  const updateVideo = async (changeTemplate = false) => {
    if (!cameraID || !accessToken) return;
    
    try {
      console.log('🎥 更新视频流:', {
        cameraID,
        channelNo,
        isLive,
        template: getCurrentTemplate(),
        isMobile
      });

      const videoData = await getVideoUrl(
        accessToken,
        cameraID,
        channelNo,
        isLive ? 1 : 2 // 1-直播，2-回放
      );
      
      const url = videoData?.data?.data?.url || '';
      if (!url) {
        console.error('❌ 获取视频URL失败');
        return;
      }

      setCanPlay(true);
      
      if (!playerRef.current || changeTemplate) {
        // 销毁之前的播放器
        if (playerRef.current) {
          try {
            playerRef.current.stop();
          } catch (e) {
            console.warn('停止之前的播放器时出现警告:', e);
          }
        }

        // 创建新播放器
        const playerConfig: any = {
          id: 'ezuikit-player',
          url,
          accessToken,
          useHardDev: YS7_CONFIG.PLAYER.USE_HARD_DEV,
          height: isMobile ? 250 : Math.min(document.documentElement.clientHeight - 200, 500),
          width: isMobile ? Math.min(window.innerWidth - 40, 350) : Math.min(document.documentElement.clientWidth - 300, 800),
          autoplay: YS7_CONFIG.PLAYER.AUTO_PLAY,
        };

        // 只有在模板不为空时才添加template属性
        const template = getCurrentTemplate();
        if (template) {
          playerConfig.template = template;
        }

        console.log('🎮 播放器配置:', playerConfig);

        playerRef.current = new EZUIKit.EZUIKitPlayer(playerConfig);
      } else {
        // 更新播放地址
        playerRef.current.changePlayUrl({
          url,
          accessToken,
          deviceSerial: cameraID,
        });
      }
    } catch (error) {
      console.error('❌ 更新视频失败:', error);
      setCanPlay(false);
    }
  };

  const initAccessToken = async () => {
    try {
      const res = await getAccessToken();
      setAccessToken(res?.accessToken || '');
      console.log('✅ 获取访问令牌成功');
    } catch (error) {
      console.error('❌ 获取访问令牌失败:', error);
    }
  };

  const selectorsDom = (
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
          模式：
        </span>
        <Select
          style={{ width: isMobile ? '100%' : 100 }}
          size={isMobile ? 'large' : 'middle'}
          options={[
            { label: '直播', value: true },
            { label: '回放', value: false },
          ]}
          onChange={(value) => setIsLive(value)}
          value={isLive}
        />
      </div>
    </div>
  );

  const surveillanceDom = (
    <div style={{ padding: isMobile ? '10px' : '20px' }}>
      {selectorsDom}
      <div style={{ 
        backgroundColor: '#000', 
        borderRadius: '8px',
        padding: '10px',
        minHeight: isMobile ? '250px' : '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div id="ezuikit-player" style={{ width: '100%', height: '100%' }}></div>
        {!canPlay && (
          <Image
            src="/noVideo.png"
            width={isMobile ? 200 : 400}
            height={isMobile ? 200 : 400}
            alt="无视频信号"
            style={{ opacity: 0.6 }}
          />
        )}
      </div>
      
      {/* 状态信息 */}
      <div style={{ 
        marginTop: '10px',
        padding: '10px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#666'
      }}>
        <Space wrap>
          <span>摄像头: {cameraType === 'lCameraId' ? '仓库外摄像头' : '仓库内摄像头'}</span>
          <span>通道: {channelNo}</span>
          <span>模式: {isLive ? '直播' : '回放'}</span>
          <span>模板: {getCurrentTemplate()}</span>
          <span>设备: {isMobile ? '移动端' : 'PC端'}</span>
          <span>设备ID: {cameraID || '未选择'}</span>
          <span>Token状态: {accessToken ? '有效' : '无效'}</span>
        </Space>
      </div>
    </div>
  );

  useEffect(() => {
    if (curWarehouseInfo) {
      setCameraID(curWarehouseInfo?.[cameraType]);
    }
  }, [curWarehouseInfo, cameraType]);

  useEffect(() => {
    initAccessToken();
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.stop();
        } catch (e) {
          console.warn('清理播放器时出现警告:', e);
        }
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (cameraID && accessToken && channelNo) {
      updateVideo();
    }
  }, [cameraID, accessToken, channelNo]);

  useEffect(() => {
    // 当模式或响应式状态改变时，重新创建播放器
    if (cameraID && accessToken) {
      updateVideo(true);
    }
  }, [isLive, isMobile]);

  return (
    <Layout curActive="/surveillance/:warehouseID">
      {surveillanceDom}
    </Layout>
  );
}
