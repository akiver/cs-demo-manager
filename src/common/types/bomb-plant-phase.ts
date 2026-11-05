export const BombPlantPhase = {
  PrePlant: 'pre-plant', // Before the bomb has been planted, includes rounds where the bomb was never planted
  PostPlant: 'post-plant', // After the bomb has been planted, excludes rounds where the bomb was never planted
} as const;

export type BombPlantPhase = (typeof BombPlantPhase)[keyof typeof BombPlantPhase];
