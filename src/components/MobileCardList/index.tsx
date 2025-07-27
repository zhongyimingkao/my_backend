'use client';
import React from 'react';
import { Card, Tag, Button, Space, Avatar, Divider } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface MobileCardItem {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  tags?: Array<{
    label: string;
    color?: string;
  }>;
  avatar?: string;
  actions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    danger?: boolean;
    onClick: () => void;
  }>;
  extra?: React.ReactNode;
}

interface MobileCardListProps {
  items: MobileCardItem[];
  loading?: boolean;
  emptyText?: string;
}

const MobileCardList: React.FC<MobileCardListProps> = ({
  items,
  loading = false,
  emptyText = '暂无数据'
}) => {
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        加载中...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        {emptyText}
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 0' }}>
      {items.map((item, index) => (
        <Card
          key={item.id}
          size="small"
          style={{
            marginBottom: '12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          bodyStyle={{ padding: '16px' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* 头像区域 */}
            {item.avatar && (
              <Avatar
                src={item.avatar}
                size="large"
                style={{ flexShrink: 0 }}
              />
            )}
            
            {/* 内容区域 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* 标题和副标题 */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#333',
                  lineHeight: '1.4',
                  marginBottom: '4px'
                }}>
                  {item.title}
                </div>
                {item.subtitle && (
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    {item.subtitle}
                  </div>
                )}
              </div>

              {/* 描述 */}
              {item.description && (
                <div style={{
                  fontSize: '13px',
                  color: '#999',
                  lineHeight: '1.4',
                  marginBottom: '12px'
                }}>
                  {item.description}
                </div>
              )}

              {/* 标签 */}
              {item.tags && item.tags.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <Space wrap size={[4, 4]}>
                    {item.tags.map((tag, tagIndex) => (
                      <Tag
                        key={tagIndex}
                        color={tag.color}
                      >
                        {tag.label}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}

              {/* 额外内容 */}
              {item.extra && (
                <div style={{ marginBottom: '12px' }}>
                  {item.extra}
                </div>
              )}

              {/* 操作按钮 */}
              {item.actions && item.actions.length > 0 && (
                <>
                  <Divider style={{ margin: '12px 0 8px 0' }} />
                  <Space wrap size={[8, 8]}>
                    {item.actions.map((action) => (
                      <Button
                        key={action.key}
                        type={action.type || 'default'}
                        size="small"
                        icon={action.icon}
                        danger={action.danger}
                        onClick={action.onClick}
                        style={{ fontSize: '12px' }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Space>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MobileCardList;
