'use client';

import { Modal, Form, Input, Space, Button, TreeSelect, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { Warehouse } from './type';
import { queryDepartmentList } from '../../departmentManage/api';

interface TreeNode {
  value: string;
  title: string;
  children?: TreeNode[];
  nodeType: 'station' | 'road';
  rawId: number;
}

interface WarehouseFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Partial<Warehouse>) => Promise<void>;
  initialValues?: Partial<Warehouse>;
}

export default function WarehouseFormModal({
  visible,
  onCancel,
  onSubmit,
  initialValues,
}: WarehouseFormModalProps) {
  const [form] = Form.useForm();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        searchTarget: initialValues.manageRoad 
          ? `road_${initialValues.manageRoad}` 
          : initialValues.manageStation 
            ? `station_${initialValues.manageStation}` 
            : undefined
      });
    }
  }, [visible, initialValues]);

  const fetchDepartmentData = async () => {
    try {
      const data = await queryDepartmentList();
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
    } catch (error) {
      message.error('加载部门数据失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 处理树形选择器值
      if (values.searchTarget) {
        const [type, id] = values.searchTarget.split('_');
        if (type === 'station') {
          values.manageStation = Number(id);
          values.manageRoad = undefined;
        } else if (type === 'road') {
          values.manageRoad = Number(id);
          const station = treeData.find(s => 
            s.children?.some(r => r.value === values.searchTarget)
          );
          if (station) {
            values.manageStation = station.rawId;
          }
        }
      }
      
      setLoading(true);
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={initialValues?.id ? '编辑仓库' : '新建仓库'}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={handleSubmit}
        >
          提交
        </Button>,
      ]}
    >
      <Form
        form={form}
        name="warehouseForm"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        autoComplete="off"
      >
        <Form.Item
          label="仓库编码"
          name="warehouseCode"
          rules={[{ required: true, message: '请输入仓库编码!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="仓库名称"
          name="warehouseName"
          rules={[{ required: true, message: '请输入仓库名称!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="仓库地址"
          name="warehouseAddr"
          rules={[{ required: true, message: '请输入仓库地址!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="所属局/路段"
          name="searchTarget"
          rules={[{ required: true, message: '请选择所属局或路段!' }]}
        >
          <TreeSelect
            treeData={treeData}
            placeholder="请选择局或路段"
            showCheckedStrategy={TreeSelect.SHOW_CHILD}
            treeDefaultExpandAll
            showSearch
            treeNodeFilterProp="title"
            allowClear
          />
        </Form.Item>
        <Form.Item
          label="描述"
          name="remark"
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          label="经度"
          name="longitude"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="纬度"
          name="latitude"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="仓库外摄像头ID"
          name="lCameraId"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="仓库内摄像头ID"
          name="rCameraId"
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}