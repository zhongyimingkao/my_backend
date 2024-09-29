'use client';
import { Button, Col, DatePicker, Form, Input, Row, Space, theme } from 'antd';
import React from 'react';
import { QueryDoorInfoReq } from './type';

interface Props {
  onSearch: (searchParams?: QueryDoorInfoReq) => void;
}

const DoorSearchForm: React.FC<Props> = ({ onSearch }) => {
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
