'use client';
import React from 'react';
import { QueryMaterialTypeReq } from '../common/api';
import MobileSearchForm from '@/components/MobileSearchForm';

interface Props {
  onSearch: (searchParams?: QueryMaterialTypeReq) => void;
}

const MaterialTypeSearchForm: React.FC<Props> = ({ onSearch }) => {
  const searchFields = [
    {
      name: 'typeName',
      label: '类型名称',
      type: 'input' as const,
      placeholder: '请输入类型名称'
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

export default MaterialTypeSearchForm;
