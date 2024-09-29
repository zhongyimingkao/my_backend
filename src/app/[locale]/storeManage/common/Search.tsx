'use client';
import { Button, Col, DatePicker, Form, Row, Select, Space, theme } from 'antd';
import React from 'react';
import { QueryPageInboundReq, QueryPageOutboundReq } from './api';

interface Props {
  onSearch: (searchParams?: QueryPageInboundReq | QueryPageOutboundReq) => void;
  type?: 'in' | 'out';
}

const StoreSearchForm: React.FC<Props> = ({ onSearch, type = 'in' }) => {
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
