'use client';
import React from 'react';
import { Table, Card, List, Tag, Space, Button } from 'antd';
import type { TableProps } from 'antd';

interface ResponsiveTableProps extends TableProps<any> {
  isMobile?: boolean;
  mobileRenderItem?: (item: any, index: number) => React.ReactNode;
  mobileTitle?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  isMobile = false,
  mobileRenderItem,
  mobileTitle,
  dataSource,
  columns,
  ...tableProps
}) => {
  // 移动端渲染
  if (isMobile && mobileRenderItem) {
    return (
      <List
        dataSource={dataSource as any[]}
        renderItem={mobileRenderItem}
        size="small"
        {...(mobileTitle && { header: <div style={{ fontWeight: 'bold' }}>{mobileTitle}</div> })}
      />
    );
  }

  // 桌面端渲染
  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      size={isMobile ? 'small' : 'middle'}
      scroll={{ x: 'max-content' }}
      pagination={{
        pageSize: isMobile ? 5 : 10,
        showSizeChanger: false,
        showQuickJumper: false,
        simple: isMobile,
      }}
      {...tableProps}
    />
  );
};

export default ResponsiveTable;
