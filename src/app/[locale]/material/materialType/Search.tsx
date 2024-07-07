'use client';
import { Button, Col, Form, Input, Row, Space, theme } from 'antd';
import React from 'react';
import { QueryMaterialTypeReq } from '../common/api';

interface Props {
  onSearch: (searchParams?: QueryMaterialTypeReq) => void;
}

const MaterialTypeSearchForm: React.FC<Props> = ({ onSearch }) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const formStyle: React.CSSProperties = {
    maxWidth: 'none',
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  return (
    <Form
      form={form}
      name="material_type_search"
      style={formStyle}
    >
      <Row gutter={24}>
        <Col
          span={8}
          key={1}
        >
          <Form.Item
            name="typeName"
            label="类型名称"
          >
            <Input placeholder="请输入类型名称" />
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

export default MaterialTypeSearchForm;
