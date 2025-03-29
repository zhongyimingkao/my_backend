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
  TreeSelect,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { Warehouse } from './type';
import { queryDepartmentList } from '../../departmentManage/api';

// 修改后的组件核心逻辑
interface TreeNode {
  value: string; // 格式：station_<id> 或 road_<id>
  title: string;
  children?: TreeNode[];
  nodeType: 'station' | 'road';
  rawId: number; // 原始ID用于搜索
}

interface Props {
  onSearch: (searchParams?: Partial<Warehouse>) => void;
}

const AdvancedSearchForm: React.FC<Props> = ({ onSearch }) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  // 获取部门数据并转换为树形结构
  useEffect(() => {
    queryDepartmentList()
      .then((data) => {
        const nodes = data.map((dept) => ({
          value: `station_${dept.id}`,
          title: dept.stationName,
          nodeType: 'station' as const,
          rawId: dept.id,
          children:
            dept.roadPOList?.map((road) => ({
              value: `road_${road.id}`,
              title: road.road,
              nodeType: 'road' as const,
              rawId: road.id,
            })) || [],
        }));
        setTreeData(nodes);
      })
      .catch(() => message.error('加载部门数据失败'));
  }, []);

  const formStyle: React.CSSProperties = {
    maxWidth: 'none',
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  // 修改搜索处理逻辑
  const handleSearch = () => {
    const values = form.getFieldsValue();
    const searchParams: Partial<Warehouse> = {
      // 保留原有搜索项
      warehouseCode: values.warehouseCode,
      status: values.status,
      // 新增其他可能存在的搜索项...
    };

    // 处理树形选择器值
    if (values.searchTarget) {
      const [type, id] = values.searchTarget.split('_');
      if (type === 'station') {
        searchParams.manageStation = Number(id);
      } else if (type === 'road') {
        searchParams.manageRoad = Number(id);
      }
    }

    onSearch(searchParams);
  };

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
        {/* 合并后的树形选择器 */}
        <Col span={8}>
          <Form.Item
            name="searchTarget"
            label="所属局/路段"
          >
            <TreeSelect
              treeData={treeData}
              placeholder="请选择局或路段"
              fieldNames={{
                label: 'title',
                value: 'value',
                children: 'children',
              }}
              showSearch
              treeNodeFilterProp="title"
              treeDefaultExpandAll
              allowClear
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
              handleSearch();
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
