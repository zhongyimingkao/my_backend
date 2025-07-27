'use client';
import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Drawer,
  Badge,
  Row,
  Col,
} from 'antd';
import MobileDatePicker, { MobileDateRangePicker } from '@/components/MobileDatePicker';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { useResponsive } from '@/hooks/useResponsive';
import dayjs from 'dayjs';


interface SearchField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'dateRange' | 'date';
  options?: { label: string; value: any }[];
  placeholder?: string;
  allowClear?: boolean;
}

interface MobileSearchFormProps {
  fields: SearchField[];
  onSearch: (values: any) => void;
  onReset?: () => void;
  initialValues?: any;
  loading?: boolean;
}

const MobileSearchForm: React.FC<MobileSearchFormProps> = ({
  fields,
  onSearch,
  onReset,
  initialValues,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const { isMobile } = useResponsive();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [hasFilters, setHasFilters] = useState(false);

  const handleSearch = (values: any) => {
    // 处理日期范围
    const processedValues = { ...values };
    fields.forEach(field => {
      if (field.type === 'dateRange' && values[field.name]) {
        processedValues[field.name] = values[field.name].map((date: any) => 
          date ? dayjs(date).format('YYYY-MM-DD') : null
        );
      } else if (field.type === 'date' && values[field.name]) {
        processedValues[field.name] = dayjs(values[field.name]).format('YYYY-MM-DD');
      }
    });
    
    onSearch(processedValues);
    setDrawerVisible(false);
    
    // 检查是否有筛选条件
    const hasValues = Object.values(processedValues).some(value => 
      value !== undefined && value !== null && value !== '' && 
      (!Array.isArray(value) || value.length > 0)
    );
    setHasFilters(hasValues);
  };

  const handleReset = () => {
    form.resetFields();
    setHasFilters(false);
    if (onReset) {
      onReset();
    } else {
      onSearch({});
    }
    setDrawerVisible(false);
  };

  const renderField = (field: SearchField) => {
    const commonProps = {
      placeholder: field.placeholder || `请${field.type === 'select' ? '选择' : '输入'}${field.label}`,
      allowClear: field.allowClear !== false,
      style: { width: '100%' },
    };

    switch (field.type) {
      case 'input':
        return <Input {...commonProps} />;
      
      case 'select':
        return (
          <Select
            {...commonProps}
            options={field.options}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        );
      
      case 'dateRange':
        if (isMobile) {
          return (
            <MobileDateRangePicker
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
              disabled={false}
            />
          );
        } else {
          return (
            <DatePicker.RangePicker
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              allowClear={field.allowClear !== false}
              placeholder={['开始日期', '结束日期']}
            />
          );
        }
      
      case 'date':
        if (isMobile) {
          return (
            <MobileDatePicker
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              placeholder={commonProps.placeholder}
              disabled={false}
            />
          );
        } else {
          return (
            <DatePicker
              {...commonProps}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />
          );
        }
      
      default:
        return <Input {...commonProps} />;
    }
  };

  if (!isMobile) {
    // 桌面端保持原有布局
    return (
      <div style={{ 
        background: '#fff', 
        padding: '16px', 
        marginBottom: '16px',
        borderRadius: '8px',
        border: '1px solid #f0f0f0'
      }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          initialValues={initialValues}
          style={{ width: '100%' }}
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            {fields.map((field, index) => (
              <Col key={field.name} xs={24} sm={12} md={8} lg={6}>
                <Form.Item
                  name={field.name}
                  label={field.label}
                  style={{ marginBottom: 0, width: '100%' }}
                >
                  {renderField(field)}
                </Form.Item>
              </Col>
            ))}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  搜索
                </Button>
                <Button 
                  onClick={handleReset}
                  icon={<ClearOutlined />}
                >
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }

  // 移动端使用抽屉式搜索
  return (
    <>
      <div style={{ 
        background: '#fff', 
        padding: '12px 16px', 
        marginBottom: '12px',
        borderRadius: '8px',
        border: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
          筛选条件
        </div>
        <Badge dot={hasFilters}>
          <Button 
            type="primary" 
            icon={<FilterOutlined />}
            onClick={() => setDrawerVisible(true)}
            size="small"
          >
            筛选
          </Button>
        </Badge>
      </div>

      <Drawer
        title="筛选条件"
        placement="bottom"
        height="70%"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{
          body: { padding: '16px' }
        }}
        footer={
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            padding: '12px 0' 
          }}>
            <Button 
              style={{ flex: 1 }}
              onClick={handleReset}
              icon={<ClearOutlined />}
            >
              重置
            </Button>
            <Button 
              type="primary" 
              style={{ flex: 2 }}
              onClick={() => form.submit()}
              icon={<SearchOutlined />}
              loading={loading}
            >
              搜索
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          initialValues={initialValues}
        >
          {fields.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              style={{ marginBottom: '16px' }}
            >
              {renderField(field)}
            </Form.Item>
          ))}
        </Form>
      </Drawer>
    </>
  );
};

export default MobileSearchForm;
