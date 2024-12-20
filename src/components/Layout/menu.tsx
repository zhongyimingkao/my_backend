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
      key: '/surveillance',
      icon: (
        <Image
          src="/jiankong.svg"
          width={14}
          height={14}
          alt=""
        />
      ),
      label: t('surveillance'),
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
    {
      key: '/material',
      icon: (
        <Image
          src="/wuliaoxianxing.svg"
          width={14}
          height={14}
          alt=""
        />
      ),
      label: t('material'),
      children: [
        {
          key: '/material/materialInfo',
          icon: (
            <Image
              src="/wuliaoxinxi.svg"
              width={14}
              height={14}
              alt=""
            />
          ),
          label: t('materialInfo'),
        },
        {
          key: '/material/materialType',
          icon: (
            <Image
              src="/wuliaoleixing.svg"
              width={14}
              height={14}
              alt=""
            />
          ),
          label: t('materialType'),
        },
      ],
    },
    {
      key: '/userManage',
      icon: (
        <Image
          src="/yonghuxinxi.svg"
          width={14}
          height={14}
          alt=""
        />
      ),
      label: t('userManage'),
    },
    {
      key: '/door',
      icon: (
        <Image
          src="/juanmen.svg"
          width={14}
          height={14}
          alt=""
        />
      ),
      label: t('door'),
    },
  ];
};

export default getNavList;
