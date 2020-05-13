import { TrainItem } from '@cross-nn/core';
import { Injectable } from '@angular/core';
import mnist from 'mnist';

@Injectable({
  providedIn: 'root'
})
export class MnistService {
  /**
   * Получить тренировочный набор
   */
  getTrainSet(size: number): TrainItem[] {
    return mnist.set(size, 0).training
      .map<TrainItem>((item: any) => {
        return {
          inputs: item.input,
          targets: item.output
        };
      });
  }
}
