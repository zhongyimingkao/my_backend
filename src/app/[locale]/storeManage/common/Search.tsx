'use client';
import {
  Button,
  Col,
  DatePicker,
  Form,
  message,
  Row,
  Select,
  Space,
  theme,
  TreeSelect,
} from 'antd';
import React, { useEffect, useState } from 'react';
import {  QueryPageInboundReq, QueryPageOutboundReq } from './api';
import { getWarehouseMenus } from '../../userManage/role/api';
import { Station } from '../../user/type';

interface Props {
  onSearch: (searchParams?: QueryPageInboundReq | QueryPageOutboundReq) => void;
  type?: 'in' | 'out';
}

const StoreSearchForm: React.FC<Props> = ({ onSearch, type = 'in' }) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [warehouseTree, setWarehouseTree] = useState<any[]>([]);

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

  return (
    <Form
      form={form}
      name="storeManage_search"
      style={formStyle}
    >
      <Row gutter={24}>
        <Col
          span={8}
          key={1}
        >
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
        {type === 'out' && (
          <Col
            span={8}
            key={1}
          >
            <Form.Item
              name="status"
              label="审核状态"
            >
              <Select
                options={[
                  { label: '待审核', value: 0 },
                  { label: '已审核', value: 1 },
                  { label: '审核失败', value: 2 },
                ]}
              />
            </Form.Item>
          </Col>
        )}
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

export default StoreSearchForm;
