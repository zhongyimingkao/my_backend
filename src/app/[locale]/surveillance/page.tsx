'use client';
import Layout from '@/components/Layout';
import { Select, Space } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getVideoUrl } from './api';
import EZUIKit from 'ezuikit-js';
import { queryWareHouse } from '../storeManage/warehouse/api';
import Image from 'next/image';

const accessToken =
  'at.7ej8xnxa681z7wo51qivk7wzdc0loh2n-2rv5oy3437-0qd8hor-pshofvr9z';

export default function Surveillance() {
  const [wareHouseId, setWareHouseId] = useState<number>();
  const [wareHouseList, setWareHouseList] = useState<any>();
  const [canPlay,setCanPlay] = useState<boolean>(false);
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

  useEffect(() => {
    if (wareHouseList?.length > 0) {
      console.log(
        'id',
        wareHouseList.find((item: any) => item.id === wareHouseId)[cameraType]
      );
      setCameraID(
        wareHouseList.find((item: any) => item.id === wareHouseId)[cameraType]
      );
    }
  }, [wareHouseId, cameraType, wareHouseList]);

  useEffect(() => {
    initOptions();
    return () => {
      playerRef?.current?.stop?.();
    };
  }, []);

  useEffect(() => {
    updateVideo(cameraID);
  }, [cameraID]);

  useEffect(() => {});

  return (
    <Layout
      curActive="/surveillance"
      defaultOpen={['/surveillance']}
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
