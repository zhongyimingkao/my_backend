'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Tag, Popover, Input, Space, Card, Empty } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import styles from './index.module.less';

export interface DepartmentData {
  id: number;
  stationName: string;
  roadPOList: Array<{
    id: number;
    road: string;
    stationId: number;
  }>;
}

export interface SelectedValue {
  type: 'all' | 'department' | 'road';
  departmentId?: number;
  departmentName?: string;
  roadId?: number;
  roadName?: string;
}

interface DepartmentSelectorProps {
  departmentData: DepartmentData[];
  value?: SelectedValue;
  onChange?: (value: SelectedValue) => void;
  placeholder?: string;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  departmentData,
  value,
  onChange,
  placeholder = '请选择局-路段'
}) => {
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentData | null>(null);
  const [currentStep, setCurrentStep] = useState<'department' | 'road'>('department');

  // 获取显示文本
  const getDisplayText = () => {
    if (!value || value.type === 'all') {
      return '全部';
    }
    if (value.type === 'department') {
      return value.departmentName || '未知局';
    }
    if (value.type === 'road') {
      return `${value.departmentName} - ${value.roadName}`;
    }
    return placeholder;
  };

  // 过滤部门数据
  const filteredDepartments = departmentData.filter(dept =>
    dept.stationName.toLowerCase().includes(searchText.toLowerCase())
  );

  // 过滤路段数据
  const filteredRoads = selectedDepartment?.roadPOList?.filter(road =>
    road.road.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  // 处理部门选择
  const handleDepartmentSelect = (dept: DepartmentData) => {
    setSelectedDepartment(dept);
    setCurrentStep('road');
    setSearchText('');
  };

  // 处理路段选择
  const handleRoadSelect = (road: { id: number; road: string }) => {
    const newValue: SelectedValue = {
      type: 'road',
      departmentId: selectedDepartment!.id,
      departmentName: selectedDepartment!.stationName,
      roadId: road.id,
      roadName: road.road
    };
    onChange?.(newValue);
    setVisible(false);
    resetState();
  };

  // 处理全部选择
  const handleSelectAll = () => {
    onChange?.({ type: 'all' });
    setVisible(false);
    resetState();
  };

  // 重置状态
  const resetState = () => {
    setSelectedDepartment(null);
    setCurrentStep('department');
    setSearchText('');
  };

  // 返回上一步
  const handleBack = () => {
    if (currentStep === 'road') {
      setCurrentStep('department');
      setSelectedDepartment(null);
      setSearchText('');
    }
  };

  // 处理可见性变化
  const handleVisibleChange = (newVisible: boolean) => {
    setVisible(newVisible);
    if (!newVisible) {
      resetState();
    }
  };

  // 渲染部门列表
  const renderDepartmentList = () => (
    <div className={styles.selectorContent}>
      <div className={styles.header}>
        <Input
          placeholder="搜索局名称"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.3)'
          }}
        />
      </div>
      
      <div className={styles.optionList}>
        {/* 全部选项 */}
        <div 
          className={styles.option}
          onClick={handleSelectAll}
        >
          <Tag 
            className={styles.optionTag}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#2c66b1',
              border: 'none',
              fontSize: '16px'
            }}
          >
            <EnvironmentOutlined /> 全部
          </Tag>
        </div>

        {/* 部门列表 */}
        {filteredDepartments.length > 0 ? (
          filteredDepartments.map(dept => (
            <div 
              key={dept.id}
              className={styles.option}
              onClick={() => handleDepartmentSelect(dept)}
            >
              <Tag 
                className={styles.optionTag}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#2c66b1',
                  border: 'none',
                  fontSize: '16px'
                }}
              >
                <EnvironmentOutlined /> {dept.stationName}
              </Tag>
              <span className={styles.roadCount}>
                {dept.roadPOList?.length || 0} 个路段
              </span>
            </div>
          ))
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description={<span style={{ color: 'white' }}>暂无匹配的局</span>}
            style={{ margin: '20px 0' }}
          />
        )}
      </div>
    </div>
  );

  // 渲染路段列表
  const renderRoadList = () => (
    <div className={styles.selectorContent}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <span onClick={handleBack} className={styles.backLink}>
            {selectedDepartment?.stationName}
          </span>
          <span className={styles.separator}> / </span>
          <span>选择路段</span>
        </div>
        <Input
          placeholder="搜索路段名称"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.3)'
          }}
        />
      </div>
      
      <div className={styles.optionList}>
        {filteredRoads.length > 0 ? (
          filteredRoads.map(road => (
            <div 
              key={road.id}
              className={styles.option}
              onClick={() => handleRoadSelect(road)}
            >
              <Tag 
                className={styles.optionTag}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#2c66b1',
                  border: 'none',
                  fontSize: '16px'
                }}
              >
                <EnvironmentOutlined /> {road.road}
              </Tag>
            </div>
          ))
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description={<span style={{ color: 'white' }}>暂无匹配的路段</span>}
            style={{ margin: '20px 0' }}
          />
        )}
      </div>
    </div>
  );

  const content = currentStep === 'department' ? renderDepartmentList() : renderRoadList();

  return (
    <Popover
      content={content}
      trigger="click"
      open={visible}
      onOpenChange={handleVisibleChange}
      placement="bottomLeft"
      overlayClassName={styles.selectorPopover}
      overlayStyle={{ width: 400 }}
    >
      <Tag 
        className={styles.selectorTag}
        style={{
          backgroundColor: '#2c66b1',
          color: 'white',
          border: '1px solid #2c66b1',
          fontSize: '17px',
          padding: '12px 20px',
          height: '40px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '150px',
          justifyContent: 'center'
        }}
      >
        <EnvironmentOutlined style={{ color: 'white', fontSize: '16px' }} />
        {getDisplayText()}
      </Tag>
    </Popover>
  );
};

export default DepartmentSelector;