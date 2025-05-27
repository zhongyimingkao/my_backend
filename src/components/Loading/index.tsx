import { Spin } from 'antd';

const Loading = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.6)',
        zIndex: 9999, // 根据你的 UI 层级调整
      }}
    >
      <Spin size="large" />
    </div>
  );
};

export default Loading;
