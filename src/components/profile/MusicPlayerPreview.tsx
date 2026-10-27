import { useEffect, useRef, useState } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMusic } from 'react-icons/fi';
import { MusicSettings } from '../../types';

interface Props {
  music?: MusicSettings;
}

export function MusicPlayerPreview({ music }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = (music?.volume ?? 50) / 100;
    a.loop = !!music?.loop;
    setVolume(music?.volume ?? 50);
  }, [music?.volume, music?.loop]);

  useEffect(() => {
    if (!music?.enabled || !music?.url || !music?.autoplay) return;
    const a = audioRef.current;
    if (!a) return;
    const tryPlay = async () => {
      try {
        await a.play();
        setPlaying(true);
      } catch {
        a.muted = true;
        setMuted(true);
        try {
          await a.play();
          setPlaying(true);
        } catch {
          setPlaying(false);
        }
      }
    };
    tryPlay();
  }, [music?.enabled, music?.url, music?.autoplay]);

  if (!music?.enabled || !music?.url) return null;

  const style = music.playerStyle || 'full';
  if (style === 'none') return null;

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      try {
        if (muted) {
          a.muted = false;
          setMuted(false);
        }
        await a.play();
        setPlaying(true);
      } catch {
        /* ignore */
      }
    }
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !muted;
    setMuted(!muted);
  };

  const changeVolume = (v: number) => {
    const a = audioRef.current;
    if (!a) return;
    const val = Math.max(0, Math.min(100, v));
    a.volume = val / 100;
    setVolume(val);
  };

  if (style === 'mini') {
    return (
      <div className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 shadow-card">
        <audio ref={audioRef} src={music.url} preload="metadata" loop={music.loop} />
        <button
          onClick={toggle}
          className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center text-white hover:brightness-110 transition"
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? <FiPause size={13} /> : <FiPlay size={13} />}
        </button>
        <button
          onClick={toggleMute}
          onMouseEnter={() => setShowVolume(true)}
          className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <FiVolumeX size={13} /> : <FiVolume2 size={13} />}
        </button>

        {showVolume && (
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 flex items-center gap-2"
            onMouseLeave={() => setShowVolume(false)}
          >
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-20 h-1 accent-brand cursor-pointer"
            />
            <span className="text-[10px] text-white font-mono">{volume}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/55 backdrop-blur-xl border border-white/15 shadow-card">
      <audio ref={audioRef} src={music.url} preload="metadata" loop={music.loop} />

      <img
        src={
          music.coverUrl ||
          `https://api.dicebear.com/7.x/shapes/svg?seed=${music.title || 'music'}`
        }
        alt=""
        className="h-11 w-11 rounded-lg object-cover border border-white/10 shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
          <FiMusic size={11} className="text-brand-soft shrink-0" />
          {music.title || 'Untitled'}
        </p>
        <p className="text-[10px] text-white/60 truncate mt-0.5">
          {music.artist || 'Unknown artist'}
        </p>
      </div>

      <div
        className="relative flex items-center"
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        <button
          onClick={toggleMute}
          className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />}
        </button>
        {showVolume && (
          <div className="absolute right-0 bottom-full mb-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-24 h-1 accent-brand cursor-pointer"
            />
            <span className="text-[10px] text-white font-mono w-6 text-right">
              {volume}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={toggle}
        className="h-10 w-10 rounded-full bg-gradient-brand text-white flex items-center justify-center hover:brightness-110 transition shrink-0 shadow-glow"
        title={playing ? 'Pause' : 'Play'}
      >
        {playing ? <FiPause size={15} /> : <FiPlay size={15} />}
      </button>
    </div>
  );
}