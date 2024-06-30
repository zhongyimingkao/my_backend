import {
  FundOutlined,
  BarChartOutlined,
  DesktopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import React from 'react';

const getNavList = (t: any) => {
  return [
    {
      key: '/',
      icon: <DesktopOutlined />,
      label: t('dashboard'),
      children: [
        {
          key: '/dashboard',
          icon: <BarChartOutlined />,
          label: t('customChart'),
        },
      ],
    },
    {
      key: '/storeManage',
      icon: (
        <Image
          src="/cangku.svg"
          width={14}
          height={14}
          alt=""
        />
      ),
      label: t('warehouse'),
      children: [
        {
          key: '/storeManage/warehouse',
          icon: (
            <Image
              src="/cangkuxinxi.svg"
              width={14}
              height={14}
              alt=""
            />
          ),
          label: t('warehouseInfo'),
        },
        {
            key: '/storeManage/in',
            icon: (
              <Image
                src="/store-in.svg"
                width={14}
                height={14}
                alt=""
              />
            ),
            label: t('storeIn'),
          },
          {
            key: '/storeManage/out',
            icon: (
              <Image
                src="/store-out.svg"
                width={14}
                height={14}
                alt=""
              />
            ),
            label: t('storeOut'),
          },
        
      ],
    },
  ];
};

export default getNavList;
