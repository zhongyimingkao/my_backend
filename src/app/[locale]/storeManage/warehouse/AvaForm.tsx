'use client';
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  theme,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { Warehouse } from './type';
import { getWarehouseMenus } from '../../userManage/role/api';

interface Props {
  onSearch: (searchParams?: Partial<Warehouse>) => void;
}

const AdvancedSearchForm: React.FC<Props> = ({ onSearch }) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [stations, setStations] = useState<{ value: string; label: string }[]>(
    []
  );
  const [roads, setRoads] = useState<{ value: string; label: string }[]>([]);

  const formStyle: React.CSSProperties = {
    maxWidth: 'none',
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  useEffect(() => {
    getWarehouseMenus()
      .then((data) => {
        const stationSet = new Set<string>();
        const roadSet = new Set<string>();

        data.forEach((station: any) => {
          if (station.manageStation) {
            stationSet.add(station.manageStation);
          }
          station.manageRoad?.forEach((road: any) => {
            if (road.roadName) {
              roadSet.add(road.roadName);
            }
          });
        });

        setStations(
          Array.from(stationSet).map((station) => ({
            value: station,
            label: station,
          }))
        );
        setRoads(
          Array.from(roadSet).map((road) => ({ value: road, label: road }))
        );
      })
      .catch(() => {
        message.error('加载仓库列表失败');
      });
  }, []);

  return (
    <Form
      form={form}
      name="advanced_search"
      style={formStyle}
    >
      <Row gutter={24}>
        <Col
          span={8}
          key={0}
        >
          <Form.Item
            name="warehouseCode"
            label="仓库信息"
          >
            <Input placeholder="请输入仓库信息" />
          </Form.Item>
        </Col>
        <Col
          span={8}
          key={1}
        >
          <Form.Item
            name="status"
            label="仓库状态"
          >
            <Select
              options={[
                { value: 0, label: '未开启' },
                { value: 1, label: '启动中' },
              ]}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col
          span={8}
          key={1}
        >
          <Form.Item
            name="manageStation"
            label="所属局"
          >
            <Select
              options={stations}
              allowClear
              placeholder="请选择所属局"
            />
          </Form.Item>
        </Col>
        <Col
          span={8}
          key={1}
        >
          <Form.Item
            name="manageRoad"
            label="所属路段"
          >
            <Select
              options={roads}
              allowClear
              placeholder="请选择所属路段"
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

export default AdvancedSearchForm;
