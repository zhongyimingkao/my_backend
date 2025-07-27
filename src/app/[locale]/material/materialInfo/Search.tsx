'use client';
import React from 'react';
import { QueryMaterialInfoReq } from '../common/api';
import MobileSearchForm from '@/components/MobileSearchForm';

interface Props {
  onSearch: (searchParams?: QueryMaterialInfoReq) => void;
}

const MaterialInfoSearchForm: React.FC<Props> = ({ onSearch }) => {
  const searchFields = [
    {
      name: 'material',
      label: '物资',
      type: 'input' as const,
      placeholder: '请输入物资信息'
    }
  ];

  return (
    <MobileSearchForm
      fields={searchFields}
      onSearch={onSearch}
      onReset={() => onSearch()}
    />
  );
};

export default MaterialInfoSearchForm;
