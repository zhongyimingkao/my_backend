'use client';
import Layout from '@/components/Layout';
import { Select, Space } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAccessToken, getVideoUrl } from './api';
import EZUIKit from 'ezuikit-js';
import { queryWareHouse } from '../storeManage/warehouse/api';
import Image from 'next/image';

const APP_KEY = '8cc3be2e5b0a4d99b84baca5ebc44872';
const APP_SECRET = 'e2201d7f6ac670816355011b664b4627';

export default function Surveillance() {
  const [wareHouseId, setWareHouseId] = useState<number>();
  const [wareHouseList, setWareHouseList] = useState<any>();
  const [accessToken, setAccessToken] = useState<string>();
  const [canPlay, setCanPlay] = useState<boolean>(false);
  const [cameraType, setCameraType] = useState<'lCameraId' | 'rCameraId'>(
    'lCameraId'
  );
  const [cameraID, setCameraID] = useState<string>('');
  const playerRef = useRef<EZUIKit | null>(null);

  const initOptions = async () => {
    const curWareHouseList = await queryWareHouse({
      pageNum: 1,
      pageSize: 1000,
    });
    setWareHouseId(curWareHouseList.records[0].id);
    setWareHouseList(curWareHouseList.records);
    setWareHouseId(curWareHouseList.records?.[0]?.id);
  };

  const options = useMemo(
    () =>
      wareHouseList?.map((item: any) => ({
        label: item.warehouseName,
        value: item.id,
      })),
    [wareHouseList]
  );

  const updateVideo = async (cameraID: string) => {
    if (!cameraID) return;
    const videoData = await getVideoUrl(accessToken, cameraID);
    const url = videoData?.data?.data?.url || '';
    if (!url) return;
    setCanPlay(true);
    if (!playerRef.current) {
      playerRef.current = new EZUIKit.EZUIKitPlayer({
        id: `ezuikit-player`,
        url,
        accessToken,
        useHardDev: true,
        height: document.documentElement.clientHeight - 220,
        width: document.documentElement.clientWidth - 280,
        template: 'pcLive',
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

  useEffect(() => {
    if (wareHouseList?.length > 0) {
      setCameraID(
        wareHouseList.find((item: any) => item.id === wareHouseId)[cameraType]
      );
    }
  }, [wareHouseId, cameraType, wareHouseList]);

  useEffect(() => {
    initOptions();
    initAccessToken();
    return () => {
      playerRef?.current?.stop?.();
    };
  }, []);

  useEffect(() => {
    if (cameraID && accessToken) {
      updateVideo(cameraID);
    }
  }, [cameraID, accessToken]);

  useEffect(() => {});

  return (
    <Layout
      curActive="/surveillance"
    >
      <Space direction="vertical">
        <h1>
          当前仓库：
          <Select
            options={options}
            value={wareHouseId}
            onChange={(value) => setWareHouseId(value)}
          />
        </h1>
        <h2>
          当前摄像头：
          <Select
            options={[
              {
                label: '左摄像头',
                value: 'lCameraId',
              },
              {
                label: '右摄像头',
                value: 'rCameraId',
              },
            ]}
            onChange={(value) => {
              setCameraType(value);
            }}
            value={cameraType}
          />
        </h2>
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
    </Layout>
  );
}
