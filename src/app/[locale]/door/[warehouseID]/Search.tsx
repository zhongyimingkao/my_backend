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
import { getWarehouseMenus } from '../../userManage/role/api';
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

  const formStyle: React.CSSProperties = {
    maxWidth: 'none',
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  const loadTreeData = () => {
    getWarehouseMenus()
      .then((data: Station[]) => {
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
      })
      .catch(() => {
        message.error('加载仓库列表失败');
      });
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
              label="选择仓库"
            >
              <TreeSelect
                treeData={warehouseTree}
                placeholder="请选择仓库"
                treeCheckable={true}
                treeDefaultExpandAll={true}
                showCheckedStrategy={TreeSelect.SHOW_CHILD}
                onChange={handleWarehouseChange}
                value={selectedWarehouses}
                style={{ width: '100%' }}
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
