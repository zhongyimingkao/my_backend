'use client';
import { Select } from 'antd';
import React, { useEffect, useState } from 'react';

interface Props {
  initData: () => Promise<any>;
  onChange: (value: string | number) => void;
}

const AsyncPicker = ({ initData, onChange }: Props): React.ReactElement => {
  const [options, setOptions] = useState<T>();

  const initOptions = async () => {
    try {
      const curOptions = await initData();
      setOptions(curOptions);
    } catch (e) {
      console.error('选择器数据初始化失败=>', e);
    }
  };

  useEffect(() => {
    initOptions();
  }, []);

  return (
    <Select
      options={options}
      onChange={onChange}
    ></Select>
  );
};
export default AsyncPicker;
