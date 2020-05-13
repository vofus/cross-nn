import { NeuralNetwork, NeuralNetworkConfig } from '@cross-nn/core';

export interface NnModelItem {
  model: NeuralNetwork;
  config: NeuralNetworkConfig | null;
  progress: number;
  downloadURL: string;
}
