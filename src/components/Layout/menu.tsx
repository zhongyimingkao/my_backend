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
      key: '/warehouse',
      icon: (
        <Image
          src="/cangku.svg"
          width={14}
          height={14}
          alt=""
        />
      ),
      label: t('warehouseManage'),
    },
  ];
};

export default getNavList;
