import { NeuralNetwork, NeuralNetworkConfig } from '@cross-nn/core';
import { SafeUrl } from '@angular/platform-browser';

export interface NnModelItem {
  model: NeuralNetwork;
  config: NeuralNetworkConfig | null;
  progress: number;
  downloadURL: SafeUrl;
}
