'use client';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Space,
  theme,
  TreeSelect,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { QueryDoorInfoReq } from './type';
import { getUserAuthorizedWarehouses, getUserRole } from '@/utils/permission';
import { Station } from '../../user/type';

interface Props {
  onSearch: (searchParams?: QueryDoorInfoReq) => void;
  warehouseID: string;
  onWarehouseChange: (warehouseIds: number[]) => void;
}

const DoorSearchForm: React.FC<Props> = ({ onSearch, warehouseID, onWarehouseChange }) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [warehouseTree, setWarehouseTree] = useState<any[]>([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);
  const [userRole, setUserRole] = useState<{role: number, isAdmin: boolean}>({
    role: 0,
    isAdmin: false
  });

  const formStyle: React.CSSProperties = {
    maxWidth: 'none',
    background: '#fff',
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  const loadTreeData = async () => {
    try {
      // 获取用户角色信息
      const roleInfo = await getUserRole();
      setUserRole(roleInfo);

      let warehouses: any[] = [];
      
      if (roleInfo.isAdmin) {
        // 超级管理员可以看到所有仓库 - 使用原有的树形结构API
        const { getWarehouseMenus } = await import('../../userManage/role/api');
        const data: Station[] = await getWarehouseMenus();
        
        const formatTreeData = data.map((station, index) => ({
          title: station.manageStation || '未命名',
          value: `station_${station.manageStationID}`,
          children: station.manageRoad?.map((road, index) => ({
            title: road.roadName || '未命名',
            value: `road_${road.roadID}`,
            children: road.warehouses?.map((warehouse: any) => ({
              title: warehouse.warehouseName || '未命名',
              value: warehouse.id,
            })),
          })),
        }));
        setWarehouseTree(formatTreeData);
      } else {
        // 普通管理员只能看到有权限的仓库 - 转换为树形结构
        const authorizedWarehouses = await getUserAuthorizedWarehouses();
        
        // 按照局和路段分组
        const stationMap = new Map();
        
        authorizedWarehouses.forEach(warehouse => {
          const stationKey = `${warehouse.manageStation}_${warehouse.manageStationName}`;
          const roadKey = `${warehouse.manageRoad}_${warehouse.manageRoadName}`;
          
          if (!stationMap.has(stationKey)) {
            stationMap.set(stationKey, {
              title: warehouse.manageStationName || '未命名',
              value: `station_${warehouse.manageStation}`,
              children: new Map()
            });
          }
          
          const station = stationMap.get(stationKey);
          if (!station.children.has(roadKey)) {
            station.children.set(roadKey, {
              title: warehouse.manageRoadName || '未命名',
              value: `road_${warehouse.manageRoad}`,
              children: []
            });
          }
          
          const road = station.children.get(roadKey);
          road.children.push({
            title: warehouse.warehouseName || '未命名',
            value: warehouse.id,
          });
        });
        
        // 转换为树形数据
        const formatTreeData = Array.from(stationMap.values()).map(station => ({
          ...station,
          children: Array.from(station.children.values())
        }));
        
        setWarehouseTree(formatTreeData);
        
        if (formatTreeData.length === 0) {
          message.warning('您暂无任何仓库权限，请联系管理员');
        }
      }
    } catch (error) {
      console.error('加载仓库列表失败:', error);
      message.error('加载仓库列表失败');
    }
  };

  useEffect(() => {
    loadTreeData();
  }, []);

  useEffect(() => {
    if (warehouseID !== 'all') {
      setSelectedWarehouses([]);
      onWarehouseChange([]);
    }
  }, [warehouseID]);

  const handleWarehouseChange = (values: number[]) => {
    setSelectedWarehouses(values);
    onWarehouseChange(values);
  };

  return (
    <Form
      form={form}
      name="material_type_search"
      style={formStyle}
    >
      <Row gutter={24}>
        {warehouseID === 'all' && (
          <Col span={8} key="warehouse">
            <Form.Item
              name="warehouseIds"
              label={`选择仓库${!userRole.isAdmin ? ' (仅显示有权限的仓库)' : ''}`}
            >
              <TreeSelect
                treeData={warehouseTree}
                placeholder={warehouseTree.length === 0 ? '暂无可选仓库' : '请选择仓库'}
                treeCheckable={true}
                treeDefaultExpandAll={true}
                showCheckedStrategy={TreeSelect.SHOW_CHILD}
                onChange={handleWarehouseChange}
                value={selectedWarehouses}
                style={{ width: '100%' }}
                disabled={warehouseTree.length === 0}
              />
            </Form.Item>
          </Col>
        )}
        <Col span={8} key="timeRange">
          <Form.Item
            name="timeRange"
            label="时间范围"
          >
            <DatePicker.RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
        </Col>
      </Row>
      <div style={{ textAlign: 'right' }}>
        <Space size="small">
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => {
              onSearch({ ...form.getFieldsValue() });
            }}
          >
            搜索
          </Button>
          <Button
            onClick={() => {
              form.resetFields();
              onSearch();
            }}
          >
            重置
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default DoorSearchForm;