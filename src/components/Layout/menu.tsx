import Image from 'next/image';
import React from 'react';
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ExportOutlined,
  ImportOutlined,
  UnlockOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  InboxOutlined,
  BoxPlotOutlined,
  TagsOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

const commonStyle = {
  filter: 'brightness(0) invert(1)', // 将图标变为白色
};

export const getHomeNavList = (t: any) => {
  return [
    {
      key: '/home/:warehouseID',
      icon: <HomeOutlined style={commonStyle} />,
      label: t('warehouseInfo'),
    },
    {
      key: '/inventoryManage/:warehouseID',
      icon: <InboxOutlined style={commonStyle} />,
      label: t('storeManage'),
    },
    {
      key: '/storeManage/in/:warehouseID',
      icon: <ImportOutlined style={commonStyle} />,
      label: t('storeIn'),
    },
    {
      key: '/storeManage/out/:warehouseID',
      icon: <ExportOutlined style={commonStyle} />,
      label: t('storeOut'),
    },
    {
      key: '/door/:warehouseID',
      icon: <UnlockOutlined style={commonStyle} />,
      label: t('door'),
    },
    {
      key: '/surveillance',
      icon: <VideoCameraOutlined style={commonStyle} />,
      label: t('surveillance'),
      children: [
        {
          key: '/surveillance/live/:warehouseID',
          icon: <EyeOutlined style={commonStyle} />,
          label: t('liveSurveillance'),
        },
        {
          key: '/surveillance/playback/:warehouseID',
          icon: <HistoryOutlined style={commonStyle} />,
          label: t('playbackSurveillance'),
        },
      ],
    },
  ];
};

export const getCommonNavList = (
  t: any,
  isSuperAdmin: boolean
): {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: any;
}[] => {
  // 1. 首页
  const homeMenu = {
      key: '/storeManage/warehouse',
      icon: <HomeOutlined style={commonStyle} />,
      label: t('warehouseInfo'),
  };

  // 2. 用户管理 (仅超级管理员可见)
  const userManageMenu = {
      key: '/userManage',
      icon: <TeamOutlined style={commonStyle} />,
      label: t('userManage'),
      children: [
        {
        key: '/userManage/webUserManage',
          icon: <UserOutlined style={commonStyle} />,
          label: t('webUserManage'),
        },
        {
        key: '/userManage/role',
          icon: <TeamOutlined style={commonStyle} />,
          label: t('role'),
        },
      ],
};

  // 3. 单位管理 (仅超级管理员可见)
  const departmentManageMenu = {
    key: '/departmentManage',
    icon: <BankOutlined style={commonStyle} />,
    label: t('departmentManage'),
  };

  // 4. 数据管理 - 根据用户权限显示不同内容
  const getDataManageMenu = () => {
    const baseChildren = [
      {
        key: '/reportExport',
        icon: <FileTextOutlined style={commonStyle} />,
        label: t('reportExport'),
      },
    ];

    // 只有系统管理员才能看到其他数据管理功能
    if (isSuperAdmin) {
      baseChildren.push(
        {
          key: '/storeManage/out/all',
          icon: <ExportOutlined style={commonStyle} />,
          label: t('storeOut'),
        },
        {
          key: '/storeManage/in/all',
          icon: <ImportOutlined style={commonStyle} />,
          label: t('storeIn'),
        },
        {
          key: '/door/all',
          icon: <UnlockOutlined style={commonStyle} />,
          label: t('door'),
        }
      );
    }

    return {
      key: '/dataManage',
      icon: <DatabaseOutlined style={commonStyle} />,
      label: t('dataManage'),
      children: baseChildren,
    };
  };

  // 物资管理 (仅超级管理员可见)
  const materialManageMenu = {
    key: '/material',
    icon: <BoxPlotOutlined style={commonStyle} />,
    label: t('material'),
    children: [
      {
        key: '/material/materialInfo',
        icon: <AppstoreOutlined style={commonStyle} />,
        label: t('materialInfo'),
      },
      {
        key: '/material/materialType',
        icon: <TagsOutlined style={commonStyle} />,
        label: t('materialType'),
      },
    ],
  };

  // 根据用户权限组装菜单
  const menuList = [homeMenu]; // 首页所有用户都能看到

  if (isSuperAdmin) {
    // 超级管理员看到所有菜单
    menuList.push(userManageMenu, departmentManageMenu, getDataManageMenu(), materialManageMenu);
  } else {
    // 普通管理员只能看到数据管理（仅包含报表导出）
    menuList.push(getDataManageMenu());
  }

  return menuList;
};