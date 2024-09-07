import './Player.css';
import { useCallback, useEffect, useRef } from 'react';
import EZUIKit from 'ezuikit-js';
import { Button } from 'antd';
import { getVideoUrl } from './api';

interface Props {
  url: string;
  token: string;
}

const Player: React.FC<Props> = ({ url, token }) => {
  const playerRef = useRef<EZUIKit | null>(null);
  const volumeRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    volumeRef?.current?.addEventListener?.('blur', (e: any) => {
      if (playerRef.current) {
        let value = (e?.target?.value || '').trim();
        if (value === '') {
          console.error('音量为空');
          return;
        }
        value = Number(value);
        if (value > 1 || value < 0) {
          console.error('音量设置错误， 取值范围在[0,1]');
          return;
        }

        value = parseInt((value * 100 + '').split('.')[0]) / 100; // 不使用 toFixed 是为了避免四舍五入问题
        playerRef.current.setVolume(value);
      } else {
        console.log('player 未初始化');
      }
    });
  }, []);

  const createPlayer = async () => {
    if (!playerRef.current && url) {
        const videoData = await getVideoUrl();
        const url = videoData?.data.data.url;
    const UIKitDEMO = new EZUIKit.EZUIKitPlayer({
            id: `player-container`,
            url,
            accessToken: token,
            width:600,
            height:400,
      })
      playerRef.current = UIKitDEMO;
    }
    playerRef?.current?.play?.();
  };

  const handleInIt = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    createPlayer();
  }, []);

  const handlePlay = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.play();
    }
  }, []);

  const handlePause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
  }, []);

  const handleDestroy = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
  }, []);

  const handleOpenSound = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.openSound();
    }
  }, []);

  const handleCloseSound = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.closeSound();
    }
  }, []);

  const handleFullScreen = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.fullScreen();
    }
  }, []);

  const handleCancelFullScreen = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.cancelFullScreen();
    }
  }, []);

  const handleGetVersion = useCallback(() => {
    if (playerRef.current) {
      console.log(playerRef.current.getVersion());
    }
  }, []);

  return (
    <div>
      <div
        id="player-container"
        style={{height:400,width:600}}
      ></div>
      <div>
        <div>
          <Button onClick={handleInIt}>init</Button>
          <Button onClick={handlePlay}>播放</Button>
          <Button onClick={handlePause}>暂停</Button>
          <Button onClick={handleOpenSound}>打开声音</Button>
          <Button onClick={handleCloseSound}>关闭声音</Button>
          <Button onClick={handleFullScreen}>开启全屏</Button>
          <Button onClick={handleCancelFullScreen}>取消全屏（ESC）</Button>
          <Button onClick={handleGetVersion}>获取版本</Button>
          <Button onClick={handleDestroy}>销毁</Button>
        </div>
        <div>
          音量：
          <input
            ref={volumeRef}
            placeholder="0-1"
          />
        </div>
      </div>
    </div>
  );
};

export default Player;
