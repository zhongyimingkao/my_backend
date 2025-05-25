import Image from 'next/image';
import React from 'react';

const commonStyle = {
  filter: 'brightness(0) invert(1)' // 将图标变为白色
};

export const getHomeNavList = (t: any) => {
  return [
    {
      key: '/home/:warehouseID',
      icon: (
        <Image
          src="/cangkuxinxi.svg"
          width={14}
          height={14}
          alt=""
          style={commonStyle}
        />
      ),
      label: t('warehouseInfo'),
    },
    {
      key: '/storeManage/in/:warehouseID',
      icon: (
        <Image
          src="/store-in.svg"
          width={14}
          height={14}
          alt=""
          style={commonStyle}
        />
      ),
      label: t('storeIn'),
    },
    {
      key: '/storeManage/out/:warehouseID',
      icon: (
        <Image
          src="/store-out.svg"
          width={14}
          height={14}
          alt=""
          style={commonStyle}
        />
      ),
      label: t('storeOut'),
    },

    {
      key: '/door/:warehouseID',
      icon: (
        <Image
          src="/juanmen.svg"
          width={14}
          height={14}
          alt=""
          style={commonStyle}
        />
      ),
      label: t('door'),
    },
    {
      key: '/surveillance/:warehouseID',
      icon: (
        <Image
          src="/jiankong.svg"
          width={14}
          height={14}
          alt=""
          style={commonStyle}
        />
      ),
      label: t('surveillance'),
    },
  ];

};

export const getCommonNavList = (t: any, isSuperAdmin: boolean) => {
  const warehouseList = [
    {
      key: '/storeManage/warehouse',
      icon: (
        <Image
          src="/cangkuxinxi.svg"
          width={14}
          height={14}
          alt=""
          style={commonStyle}
        />
      ),
      label: t('warehouseInfo'),
    },
  ];

  const adminList = [
    {
      key: '/material',
      icon: (
        <Image
          src="/wuliaoxianxing.svg"
          width={14}
          height={14}
          alt=""
          style={commonStyle}
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
              style={commonStyle}
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
              style={commonStyle}
            />
          ),
          label: t('materialType'),
        },
      ],
    },
    {
      key: '/departmentManage',
      icon: (
        <Image
          src="/wuliaoxianxing.svg"
          width={14}
          height={14}
          alt=""
          style={commonStyle}
        />
      ),
      label: t('departmentManage'),
    },
    {
      key: '/userManage',
      icon: (
        <Image
          src="/yonghuxinxi.svg"
          width={14}
          height={14}
          alt=""
          style={commonStyle}
        />
      ),
      label: t('userManage'),
      children: [
        {
          key: '/webUserManage',
          icon: (
            <Image
              src="/yonghuxinxi.svg"
              width={14}
              height={14}
              alt=""
              style={commonStyle}
            />
          ),
          label: t('webUserManage'),
        },
        {
          key: '/role',
          icon: (
            <Image
              src="/yonghuxinxi.svg"
              width={14}
              height={14}
              alt=""
              style={commonStyle}
            />
          ),
          label: t('role'),
        },
      ]
    },
  ];

  if (!isSuperAdmin) {
    return warehouseList;
  }
  return warehouseList.concat(adminList)
}
