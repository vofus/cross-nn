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

  /**
   * Получить массив с тренировочными наборами для тестирования
   */
  getTestSets(count: number = 50): TrainItem[][] {
    const testSets: TrainItem[][] = [];

    for (let i = 0; i < 10; ++i) {
      const numberTestSet = mnist[i].set(0, count - 1)
        .map<TrainItem>((item: any) => {
          return {
            inputs: item.input,
            targets: item.output
          };
        });

      testSets.push(numberTestSet);
    }

    return testSets;
  }
}
