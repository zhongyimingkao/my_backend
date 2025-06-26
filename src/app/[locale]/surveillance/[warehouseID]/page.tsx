'use client';
import Layout from '@/components/Layout';
import { Select, Space, Tabs } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAccessToken, getVideoUrl } from './api';
import EZUIKit from 'ezuikit-js';
import Image from 'next/image';
import styles from './page.module.css';
import { queryWareHouse } from '../../user/api';
import { useParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { warehouseInfo } from '../../store';

const APP_KEY = '8cc3be2e5b0a4d99b84baca5ebc44872';
const APP_SECRET = 'e2201d7f6ac670816355011b664b4627';

export default function Surveillance() {
  const [curWarehouseInfo] = useAtom(warehouseInfo);
  const [wareHouseList, setWareHouseList] = useState<any>();
  const [accessToken, setAccessToken] = useState<string>();
  const [canPlay, setCanPlay] = useState<boolean>(false);
  const [cameraType, setCameraType] = useState<'lCameraId' | 'rCameraId'>(
    'lCameraId'
  );
  const [cameraID, setCameraID] = useState<string>('');
  const [channelNo, setChannelNo] = useState<number>(1);
  const [template, setTemplate] = useState<string>('pcLive');

  const playerRef = useRef<EZUIKit | null>(null);

  const updateVideo = async (changeTemplate = false) => {
    if (!cameraID) return;
    const videoData = await getVideoUrl(
      accessToken,
      cameraID,
      channelNo,
      template === 'pcLive' ? 1 : 2
    );
    const url = videoData?.data?.data?.url || '';
    if (!url) return;
    setCanPlay(true);
    if (!playerRef.current || changeTemplate) {
      playerRef.current = new EZUIKit.EZUIKitPlayer({
        id: `ezuikit-player`,
        url,
        accessToken,
        useHardDev: true,
        height: document.documentElement.clientHeight - 180,
        width: document.documentElement.clientWidth - 280,
        template,
      });
    } else {
      playerRef.current.changePlayUrl({
        url,
        accessToken,
        deviceSerial: cameraID,
      });
    }
  };

  const initAccessToken = () => {
    getAccessToken(APP_KEY, APP_SECRET).then((res) => {
      setAccessToken(res?.accessToken || '');
    });
  };

  const selectorsDom = (
    <div className={styles.pageSelector}>
      <h2>
        当前摄像头：
        <Select
          options={[
            {
              label: '仓库外摄像头',
              value: 'lCameraId',
            },
            {
              label: '仓库内摄像头',
              value: 'rCameraId',
            },
          ]}
          onChange={(value) => {
            setCameraType(value);
          }}
          value={cameraType}
        />
      </h2>
      <h2>
        当前通道：
        <Select
          options={[
            {
              label: '通道一',
              value: 1,
            },
            {
              label: '通道二',
              value: 2,
            },
          ]}
          onChange={(value) => {
            setChannelNo(value);
          }}
          value={channelNo}
        />
      </h2>
      <h2>
        当前模式：
        <Select
          options={[
            {
              label: '直播',
              value: 'pcLive',
            },
            {
              label: '回放',
              value: 'pcRec',
            },
          ]}
          onChange={(value) => {
            setTemplate(value);
          }}
          value={template}
        />
      </h2>
    </div>
  );

  const surveillanceDom = (
    <Space direction="vertical">
      {selectorsDom}
      <div id="ezuikit-player"></div>
      {!canPlay && (
        <Image
          src="/noVideo.png"
          width={400}
          height={400}
          alt=""
        />
      )}
    </Space>
  );

  useEffect(() => {
    if (curWarehouseInfo) {
      setCameraID(
        curWarehouseInfo?.[cameraType]
      );
    }
  }, [curWarehouseInfo, cameraType]);

  useEffect(() => {
    initAccessToken();
    return () => {
      playerRef?.current?.stop?.();
    };
  }, []);

  useEffect(() => {
    if (cameraID && accessToken && channelNo) {
      updateVideo();
    }
  }, [cameraID, accessToken, channelNo]);

  useEffect(() => {
    if (template) {
      updateVideo(true);
    }
  }, [template]);

  return (
    <Layout
      curActive="/surveillance/:warehouseID"
    >
      {surveillanceDom}
    </Layout>
  );
}
