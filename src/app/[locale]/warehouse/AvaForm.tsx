'use client';
import { Button, Col, Form, Input, Row, Select, Space, theme } from 'antd';
import React from 'react';
import { Warehouse } from './type';

interface Props {
  onSearch: (searchParams?: Partial<Warehouse>) => void;
}

const AdvancedSearchForm: React.FC<Props> = ({ onSearch }) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const formStyle: React.CSSProperties = {
    maxWidth: 'none',
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
  };

  return (
    <Form
      form={form}
      name="advanced_search"
      style={formStyle}
      onFinish={onFinish}
    >
      <Row gutter={24}>
        <Col
          span={8}
          key={0}
        >
          <Form.Item
            name="warehouseCode"
            label="仓库编码"
          >
            <Input placeholder="请输入仓库编码" />
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
            }}
          >
            清空
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default AdvancedSearchForm;
