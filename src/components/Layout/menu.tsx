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

// PC端使用白色图标，移动端使用蓝色图标
const getPCIconStyle = () => ({
  color: '#ffffff', // PC端白色图标
  fontSize: '16px',
});

const getMobileIconStyle = () => ({
  color: '#1890ff', // 移动端蓝色图标
  fontSize: '16px',
});

// 根据环境动态选择样式
const getIconStyle = (isMobile?: boolean) => {
  return isMobile ? getMobileIconStyle() : getPCIconStyle();
};

export const getHomeNavList = (t: any, isMobile?: boolean) => {
  const iconStyle = getIconStyle(isMobile);
  return [
    {
      key: '/home/:warehouseID',
      icon: <HomeOutlined style={iconStyle} />,
      label: t('warehouseInfo'),
    },
    {
      key: '/inventoryManage/:warehouseID',
      icon: <InboxOutlined style={iconStyle} />,
      label: t('storeManage'),
    },
    {
      key: '/storeManage/in/:warehouseID',
      icon: <ImportOutlined style={iconStyle} />,
      label: t('storeIn'),
    },
    {
      key: '/storeManage/out/:warehouseID',
      icon: <ExportOutlined style={iconStyle} />,
      label: t('storeOut'),
    },
    {
      key: '/door/:warehouseID',
      icon: <UnlockOutlined style={iconStyle} />,
      label: t('door'),
    },
    {
      key: '/surveillance',
      icon: <VideoCameraOutlined style={iconStyle} />,
      label: t('surveillance'),
      children: isMobile ? [
        // 移动端只显示直播监控
        {
          key: '/surveillance/live/:warehouseID',
          icon: <EyeOutlined style={iconStyle} />,
          label: t('liveSurveillance'),
        },
      ] : [
        // PC端显示所有监控功能
        {
          key: '/surveillance/live/:warehouseID',
          icon: <EyeOutlined style={iconStyle} />,
          label: t('liveSurveillance'),
        },
        {
          key: '/surveillance/playback/:warehouseID',
          icon: <HistoryOutlined style={iconStyle} />,
          label: t('playbackSurveillance'),
        },
      ],
    },
  ];
};

export const getCommonNavList = (
  t: any,
  isSuperAdmin: boolean,
  isMobile?: boolean
): {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: any;
}[] => {
  const iconStyle = getIconStyle(isMobile);
  
  // 1. 首页
  const homeMenu = {
      key: '/storeManage/warehouse',
      icon: <HomeOutlined style={iconStyle} />,
      label: t('warehouseInfo'),
  };

  // 2. 用户管理 (仅超级管理员可见)
  const userManageMenu = {
      key: '/userManage',
      icon: <TeamOutlined style={iconStyle} />,
      label: t('userManage'),
      children: [
        {
        key: '/userManage/webUserManage',
          icon: <UserOutlined style={iconStyle} />,
          label: t('webUserManage'),
        },
        {
        key: '/userManage/role',
          icon: <TeamOutlined style={iconStyle} />,
          label: t('role'),
        },
      ],
};

  // 3. 单位管理 (仅超级管理员可见)
  const departmentManageMenu = {
    key: '/departmentManage',
    icon: <BankOutlined style={iconStyle} />,
    label: t('departmentManage'),
  };

  // 4. 数据管理 - 根据用户权限显示不同内容
  const getDataManageMenu = () => {
    const baseChildren = [
      {
        key: '/reportExport',
        icon: <FileTextOutlined style={iconStyle} />,
        label: t('reportExport'),
      },
    ];

    // 只有系统管理员才能看到其他数据管理功能
    if (isSuperAdmin) {
      baseChildren.push(
        {
          key: '/storeManage/out/all',
          icon: <ExportOutlined style={iconStyle} />,
          label: t('storeOut'),
        },
        {
          key: '/storeManage/in/all',
          icon: <ImportOutlined style={iconStyle} />,
          label: t('storeIn'),
        },
        {
          key: '/door/all',
          icon: <UnlockOutlined style={iconStyle} />,
          label: t('door'),
        }
      );
    }

    return {
      key: '/dataManage',
      icon: <DatabaseOutlined style={iconStyle} />,
      label: t('dataManage'),
      children: baseChildren,
    };
  };

  // 物资管理 (仅超级管理员可见)
  const materialManageMenu = {
    key: '/material',
    icon: <BoxPlotOutlined style={iconStyle} />,
    label: t('material'),
    children: [
      {
        key: '/material/materialInfo',
        icon: <AppstoreOutlined style={iconStyle} />,
        label: t('materialInfo'),
      },
      {
        key: '/material/materialType',
        icon: <TagsOutlined style={iconStyle} />,
        label: t('materialType'),
      },
    ],
  };

  // 根据用户权限组装菜单
  const menuList = [homeMenu]; // 首页所有用户都能看到

  if (isSuperAdmin) {
    // 超级管理员看到所有菜单，但移动端隐藏单位管理
    if (isMobile) {
      menuList.push(userManageMenu, getDataManageMenu(), materialManageMenu);
    } else {
      menuList.push(userManageMenu, departmentManageMenu, getDataManageMenu(), materialManageMenu);
    }
  } else {
    // 普通管理员只能看到数据管理（仅包含报表导出）
    menuList.push(getDataManageMenu());
  }

  return menuList;
};
