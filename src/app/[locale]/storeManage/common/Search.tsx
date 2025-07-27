'use client';
import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { QueryPageInboundReq, QueryPageOutboundReq } from './api';
import { getUserAuthorizedWarehouses, getUserRole } from '@/utils/permission';
import { Station } from '../../user/type';
import MobileSearchForm from '@/components/MobileSearchForm';

interface Props {
  onSearch: (searchParams?: QueryPageInboundReq | QueryPageOutboundReq) => void;
  type?: 'in' | 'out';
  warehouseID: string;
  onWarehouseChange: (warehouseIds: number[]) => void;
}

const StoreSearchForm: React.FC<Props> = ({ onSearch, type, warehouseID, onWarehouseChange }) => {
  const [warehouseOptions, setWarehouseOptions] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<{role: number, isAdmin: boolean}>({
    role: 0,
    isAdmin: false
  });

  const loadWarehouseData = async () => {
    try {
      // 获取用户角色信息
      const roleInfo = await getUserRole();
      setUserRole(roleInfo);

      if (roleInfo.isAdmin) {
        // 超级管理员可以看到所有仓库
        const { getWarehouseMenus } = await import('../../userManage/role/api');
        const data: Station[] = await getWarehouseMenus();
        
        // 扁平化仓库选项
        const options: any[] = [];
        data.forEach(station => {
          station.manageRoad?.forEach(road => {
            road.warehouses?.forEach(warehouse => {
              options.push({
                label: `${station.manageStation} - ${road.roadName} - ${warehouse.warehouseName}`,
                value: warehouse.id
              });
            });
          });
        });
        setWarehouseOptions(options);
      } else {
        // 普通管理员只能看到有权限的仓库
        const authorizedWarehouses = await getUserAuthorizedWarehouses();
        const options = authorizedWarehouses.map(warehouse => ({
          label: `${warehouse.manageStationName} - ${warehouse.manageRoadName} - ${warehouse.warehouseName}`,
          value: warehouse.id
        }));
        setWarehouseOptions(options);
        
        if (options.length === 0) {
          message.warning('您暂无任何仓库权限，请联系管理员');
        }
      }
    } catch (error) {
      console.error('加载仓库列表失败:', error);
      message.error('加载仓库列表失败');
    }
  };

  useEffect(() => {
    loadWarehouseData();
  }, []);

  const handleSearch = (values: any) => {
    const { warehouseIds, timeRange, ...otherValues } = values;
    
    // 处理仓库选择
    if (warehouseID === 'all' && warehouseIds) {
      onWarehouseChange(warehouseIds);
    }
    
    // 处理时间范围
    let processedValues = { ...otherValues };
    if (timeRange && timeRange.length === 2) {
      processedValues.timeRange = timeRange;
    }
    
    onSearch(processedValues);
  };

  const handleReset = () => {
    if (warehouseID === 'all') {
      onWarehouseChange([]);
    }
    onSearch();
  };

  // 构建搜索字段
  const searchFields: any[] = [];
  
  // 如果是查看所有仓库，添加仓库选择字段
  if (warehouseID === 'all') {
    searchFields.push({
      name: 'warehouseIds',
      label: `选择仓库${!userRole.isAdmin ? ' (仅显示有权限的仓库)' : ''}`,
      type: 'select' as const,
      options: warehouseOptions,
      placeholder: warehouseOptions.length === 0 ? '暂无可选仓库' : '请选择仓库'
    });
  }
  
  // 添加时间范围字段
  searchFields.push({
    name: 'timeRange',
    label: '时间范围',
    type: 'dateRange' as const,
    placeholder: '请选择时间范围'
  });

  // 如果是出库，添加审核状态字段
  if (type === 'out') {
    searchFields.push({
      name: 'status',
      label: '审核状态',
      type: 'select' as const,
      options: [
        { label: '待审核', value: 0 },
        { label: '已审核', value: 1 },
        { label: '审核失败', value: 2 },
      ],
      placeholder: '请选择审核状态'
    });
  }

  return (
    <MobileSearchForm
      fields={searchFields}
      onSearch={handleSearch}
      onReset={handleReset}
    />
  );
};

export default StoreSearchForm;
