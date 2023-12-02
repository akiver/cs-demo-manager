import { useViewerContext } from '../use-viewer-context';

export const AudioFileName = {
  CTFlashbang: 'ct_flashbang.wav',
  TFlashbang: 't_flashbang.wav',
  CTGrenade: 'ct_grenade.wav',
  TGrenade: 't_grenade.wav',
  CTMolotov: 'ct_molotov.wav',
  TMolotov: 't_molotov.wav',
  CTSmoke: 'ct_smoke.wav',
  TSmoke: 't_smoke.wav',
  CTDecoy: 'ct_decoy.wav',
  TDecoy: 't_decoy.wav',
  BombPlanted: 'bomb_planted.wav',
  BombDefused: 'bomb_defused.wav',
  BombExploded: 'bomb_exploded.wav',
  DeathT: 't_death.wav',
  DeathCt: 'ct_death.wav',
} as const;
export type AudioFileName = (typeof AudioFileName)[keyof typeof AudioFileName];

export function usePlaySound() {
  const { volume, isPlaying, currentFrame, audioPerFrame } = useViewerContext();

  const playSound = (audioFileName: AudioFileName) => {
    if (!isPlaying) {
      return;
    }

    // Don't play the sound several times at the same frame to avoid echos
    if (audioPerFrame[audioFileName] === currentFrame) {
      delete audioPerFrame[audioFileName];
      return;
    }

    const audio = window.csdm.getAudio(audioFileName);
    audio.volume = volume;
    audio.play();
    audioPerFrame[audioFileName] = currentFrame;
  };

  return { playSound };
}
