import { LearningGradAlgorithm } from '@cross-nn/core';

export interface ModelTrainingResponse {
  algorithm: LearningGradAlgorithm;
  trainingSetSize: number;
  epochs: number;
}
