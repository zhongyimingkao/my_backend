'use client';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Space,
  TimePicker,
  theme,
} from 'antd';
import React from 'react';
import { QueryPageInboundReq, QueryPageOutboundReq } from './api';

interface Props {
  onSearch: (searchParams?: QueryPageInboundReq | QueryPageOutboundReq) => void;
}

const StoreSearchForm: React.FC<Props> = ({ onSearch }) => {
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
      name="advanced_search"
      style={formStyle}
    >
      <Row gutter={24}>
        <Col
          span={8}
          key={0}
        >
          <Form.Item
            name="warehouseId"
            label="仓库"
          >
            <Select
              options={[
                { value: 0, label: '未开启' },
                { value: 1, label: '启动中' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col
          span={8}
          key={1}
        >
          <Form.Item
            name="materialId"
            label="物料"
          >
            <Select
              options={[
                { value: 0, label: '未开启' },
                { value: 1, label: '启动中' },
              ]}
            />
          </Form.Item>
        </Col>
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
              console.log('form',form.getFieldsValue())
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

export default StoreSearchForm;
