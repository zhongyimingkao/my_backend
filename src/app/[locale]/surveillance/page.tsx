'use client';
import Layout from '@/components/Layout';
import { Button, Select, Space, Tabs, theme } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { getVideoUrl } from './api';
import EZUIKit from 'ezuikit-js';
import { queryWareHouse } from '../storeManage/warehouse/api';

export default function Surveillance() {
  const [current, setCurrent] = useState<number>(1);
  const { token } = theme.useToken();
  const [options,setOptions] = useState<{label:string,value:string}[]>([]);
  const playerRef = useRef<EZUIKit | null>(null);

  const initVideo = async () => {
    const videoData = await getVideoUrl();
    const url = videoData?.data?.data?.url || '';

    if (!playerRef.current) {
      playerRef.current = new EZUIKit.EZUIKitPlayer({
        id: `ezuikit-player`,
        url,
        accessToken:
          'at.9fgihzrsb2cup1ij83ed9vht36fvd3lv-6t73i93na6-17t5tp3-dbitse9ob',
        useHardDev: true,
        height: document.documentElement.clientHeight - 220,
        width: document.documentElement.clientWidth - 280,
        template: 'pcLive',
      });
    }
  };

  useEffect(() => {
    initVideo();
    return ()=>{
      playerRef?.current?.stop?.();
    }
  }, []);

  return (
    <Layout
      curActive="/surveillance"
      defaultOpen={['/surveillance']}
    >
      <Space direction="vertical">
        <h1>
          当前仓库：
          <Select
            options={[
              {
                label: '仓库0',
                value: 0,
              },
              {
                label: '仓库1',
                value: 1,
              },
            ]}
            defaultValue={0}
          />
        </h1>
        <h2>
          当前摄像头：
          <Select
            options={options}
            defaultValue={0}
          />
        </h2>
        <div id="ezuikit-player"></div>
      </Space>
    </Layout>
  );
}
