'use client';
import React, { useState } from 'react';
import { DatePicker, DatePickerProps } from 'antd';
import { useResponsive } from '@/hooks/useResponsive';
import './index.css';

interface CustomDatePickerProps extends DatePickerProps {
  // 可以添加自定义属性
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = (props) => {
  const { isMobile } = useResponsive();
  
  return (
    <DatePicker
      {...props}
      className={`custom-datepicker ${isMobile ? 'mobile-datepicker' : ''} ${props.className || ''}`}
      getPopupContainer={(trigger) => trigger.parentElement || document.body}
      placement={isMobile ? 'bottomLeft' : 'bottomLeft'}
    />
  );
};

export default CustomDatePicker;
