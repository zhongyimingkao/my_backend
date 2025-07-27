'use client';
import React, { useState } from 'react';
import { Modal, Input, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useResponsive } from '@/hooks/useResponsive';
import dayjs, { Dayjs } from 'dayjs';

interface MobileDatePickerProps {
  value?: Dayjs | null;
  onChange?: (date: Dayjs | null) => void;
  placeholder?: string;
  format?: string;
  showTime?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
}

const MobileDatePicker: React.FC<MobileDatePickerProps> = ({
  value,
  onChange,
  placeholder = '请选择日期',
  format = 'YYYY-MM-DD',
  showTime = false,
  style,
  disabled = false
}) => {
  const { isMobile } = useResponsive();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState<string>('');

  const formatString = showTime ? 'YYYY-MM-DD HH:mm:ss' : format;

  const handleInputClick = () => {
    if (disabled) return;
    
    if (isMobile) {
      setModalVisible(true);
      setTempValue(value ? value.format(formatString) : '');
    }
  };

  const handleConfirm = () => {
    if (tempValue) {
      const date = dayjs(tempValue);
      if (date.isValid()) {
        onChange?.(date);
      }
    } else {
      onChange?.(null);
    }
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setTempValue('');
  };

  const displayValue = value ? value.format(formatString) : '';

  if (!isMobile) {
    // 桌面端使用原生input
    const inputType = showTime ? 'datetime-local' : 'date';
    const inputValue = value ? value.format(showTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD') : '';
    
    return (
      <input
        type={inputType}
        value={inputValue}
        onChange={(e) => {
          if (e.target.value) {
            const date = dayjs(e.target.value);
            onChange?.(date);
          } else {
            onChange?.(null);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '4px 11px',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          fontSize: '14px',
          lineHeight: '1.5715',
          ...style
        }}
      />
    );
  }

  // 移动端使用Modal + 原生input
  return (
    <>
      <Input
        value={displayValue}
        placeholder={placeholder}
        readOnly
        onClick={handleInputClick}
        suffix={<CalendarOutlined />}
        style={style}
        disabled={disabled}
      />
      
      <Modal
        title="选择日期时间"
        open={modalVisible}
        onOk={handleConfirm}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ marginBottom: 8, fontSize: '14px', fontWeight: 'bold' }}>
            {showTime ? '选择日期和时间' : '选择日期'}
          </div>
          <input
            type={showTime ? 'datetime-local' : 'date'}
            value={tempValue ? dayjs(tempValue).format(showTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD') : ''}
            onChange={(e) => {
              if (e.target.value) {
                const date = dayjs(e.target.value);
                setTempValue(date.format(formatString));
              } else {
                setTempValue('');
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '16px',
              lineHeight: '1.5'
            }}
          />
        </Space>
      </Modal>
    </>
  );
};

interface MobileDateRangePickerProps {
  value?: [Dayjs | null, Dayjs | null] | null;
  onChange?: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  placeholder?: [string, string];
  format?: string;
  showTime?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
}

const MobileDateRangePicker: React.FC<MobileDateRangePickerProps> = ({
  value,
  onChange,
  placeholder = ['开始日期', '结束日期'],
  format = 'YYYY-MM-DD',
  showTime = false,
  style,
  disabled = false
}) => {
  const { isMobile } = useResponsive();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempStartValue, setTempStartValue] = useState<string>('');
  const [tempEndValue, setTempEndValue] = useState<string>('');

  const formatString = showTime ? 'YYYY-MM-DD HH:mm:ss' : format;

  const handleInputClick = () => {
    if (disabled) return;
    
    if (isMobile) {
      setModalVisible(true);
      setTempStartValue(value?.[0] ? value[0].format(formatString) : '');
      setTempEndValue(value?.[1] ? value[1].format(formatString) : '');
    }
  };

  const handleConfirm = () => {
    const startDate = tempStartValue ? dayjs(tempStartValue) : null;
    const endDate = tempEndValue ? dayjs(tempEndValue) : null;
    
    if (startDate?.isValid() && endDate?.isValid()) {
      onChange?.([startDate, endDate]);
    } else if (!tempStartValue && !tempEndValue) {
      onChange?.(null);
    }
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setTempStartValue('');
    setTempEndValue('');
  };

  const displayValue = value && value[0] && value[1] 
    ? `${value[0].format(formatString)} ~ ${value[1].format(formatString)}`
    : '';

  if (!isMobile) {
    // 桌面端使用两个原生input
    const inputType = showTime ? 'datetime-local' : 'date';
    const startValue = value?.[0] ? value[0].format(showTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD') : '';
    const endValue = value?.[1] ? value[1].format(showTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD') : '';
    
    return (
      <div style={{ display: 'flex', ...style }}>
        <input
          type={inputType}
          value={startValue}
          onChange={(e) => {
            const startDate = e.target.value ? dayjs(e.target.value) : null;
            const endDate = value?.[1] || null;
            if (onChange) {
              onChange([startDate, endDate]);
            }
          }}
          placeholder={placeholder[0]}
          disabled={disabled}
          style={{
            width: '50%',
            padding: '4px 11px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px 0 0 6px',
            fontSize: '14px',
            lineHeight: '1.5715'
          }}
        />
        <input
          type={inputType}
          value={endValue}
          onChange={(e) => {
            const startDate = value?.[0] || null;
            const endDate = e.target.value ? dayjs(e.target.value) : null;
            if (onChange) {
              onChange([startDate, endDate]);
            }
          }}
          placeholder={placeholder[1]}
          disabled={disabled}
          style={{
            width: '50%',
            padding: '4px 11px',
            border: '1px solid #d9d9d9',
            borderLeft: 'none',
            borderRadius: '0 6px 6px 0',
            fontSize: '14px',
            lineHeight: '1.5715'
          }}
        />
      </div>
    );
  }

  // 移动端使用Modal + 原生input
  return (
    <>
      <Input
        value={displayValue}
        placeholder={`${placeholder[0]} ~ ${placeholder[1]}`}
        readOnly
        onClick={handleInputClick}
        suffix={<CalendarOutlined />}
        style={style}
        disabled={disabled}
      />
      
      <Modal
        title="选择时间范围"
        open={modalVisible}
        onOk={handleConfirm}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 8, fontSize: '14px', fontWeight: 'bold' }}>
              {placeholder[0]}
            </div>
            <input
              type={showTime ? 'datetime-local' : 'date'}
              value={tempStartValue ? dayjs(tempStartValue).format(showTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD') : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const date = dayjs(e.target.value);
                  setTempStartValue(date.format(formatString));
                } else {
                  setTempStartValue('');
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '16px',
                lineHeight: '1.5'
              }}
            />
          </div>
          
          <div>
            <div style={{ marginBottom: 8, fontSize: '14px', fontWeight: 'bold' }}>
              {placeholder[1]}
            </div>
            <input
              type={showTime ? 'datetime-local' : 'date'}
              value={tempEndValue ? dayjs(tempEndValue).format(showTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD') : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const date = dayjs(e.target.value);
                  setTempEndValue(date.format(formatString));
                } else {
                  setTempEndValue('');
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '16px',
                lineHeight: '1.5'
              }}
            />
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default MobileDatePicker;
export { MobileDateRangePicker };
