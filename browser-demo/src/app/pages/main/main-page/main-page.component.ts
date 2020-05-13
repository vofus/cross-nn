import { Component, OnInit } from '@angular/core';
import { BrowserAdapter } from '@cross-nn/browser';
import { MnistService } from '@core/mnist/mnist.service';
import { ModelEditorService } from '@shared/model-editor/model-editor.service';
import { LearningGradAlgorithm, NeuralNetwork, NeuralNetworkConfig, TrainItem } from '@cross-nn/core';
import { NnModelItem } from './types';
import { ModelTrainingService } from '@shared/model-training/model-training.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  private readonly WORKER_URL = 'workers/cross-nn.worker.js';
  private nnAdapter: BrowserAdapter = null;
  public threadsConfig = {
    count: 4,
    changed: false
  };

  public models: NnModelItem[] = [];

  constructor(
    private mnist: MnistService,
    private modelEditor: ModelEditorService,
    private modelTraining: ModelTrainingService
  ) { }

  ngOnInit(): void {
    this.nnAdapter = new BrowserAdapter(this.WORKER_URL, this.threadsConfig.count);
  }

  public setThreadCount(count: number) {
    this.threadsConfig.changed = true;
    this.threadsConfig.count = typeof count === 'number'
      && !isNaN(count)
      && count > 0
        ? count
        : 1;
  }

  public updateBrowserAdapter() {
    this.threadsConfig.changed = false;

    const adapter = new BrowserAdapter(this.WORKER_URL, this.threadsConfig.count);
    const epochCount = 10;

    const nnConfig: NeuralNetworkConfig = {
      neuronCounts: [2, 30, 50, 30, 1],
      learningRate: 0.3,
      moment: 0.3
    };

    const trainSet: TrainItem[] = [
      {inputs: [0, 1], targets: [1]},
      {inputs: [1, 0], targets: [1]},
      {inputs: [0, 0], targets: [0]},
      {inputs: [1, 1], targets: [0]}
    ];

    const scaledTrainSet: TrainItem[] = [];
    for (let i = 0; i < 100; ++i) {
      scaledTrainSet.push(...trainSet);
    }

    for (let i = 0; i < 8; ++i) {
      this.models[i] = {progress: 0} as any;

      adapter.gradAlgorithmTrainAsync(
        new NeuralNetwork(nnConfig),
        LearningGradAlgorithm.BACK_PROP,
        scaledTrainSet,
        epochCount,
        ({epochNumber, epochTime}) => {
          const percent = Math.ceil((epochNumber/epochCount) * 100);

          this.models[i] = {progress: percent} as any;
          console.log('=== ' + i + ' === ' + `Complete percent: ${percent}% (${epochTime}ms)`);
        }
      ).then((nn) => {
        console.log('=== ' + i + ' ===' + '[0, 1]: ', nn.query([0, 1]).toArray()[0]);
        console.log('=== ' + i + ' ===' + '[1, 0]: ', nn.query([1, 0]).toArray()[0]);
        console.log('=== ' + i + ' ===' + '[0, 0]: ', nn.query([0, 0]).toArray()[0]);
        console.log('=== ' + i + ' ===' + '[1, 1]: ', nn.query([1, 1]).toArray()[0]);
      })
        .catch(console.error);
    }
  }

  /**
   * Добавить новую модель нейронной сети
   */
  public async createNewModel() {
    const config = await this.modelEditor.open().toPromise();

    if (Boolean(config)) {
      const model = new NeuralNetwork(config);

      this.models.push({
        model,
        config,
        progress: 0,
        downloadURL: ''
      });
    }
  }

  /**
   * Загрузить нейронную сеть из файла
   */
  public async loadModel(event: Event) {
    const model = await this.nnAdapter.loadNeuralNetwork(event.target as HTMLInputElement);

    if (Boolean(model)) {
      this.models.push({
        model,
        config: null,
        progress: 0,
        downloadURL: ''
      });
    }
  }

  /**
   * Настроить тренировку нейронной сети
   */
  public async trainModel(event: Event, model: NnModelItem) {
    event.stopPropagation();
    const config = await this.modelTraining.open().toPromise();
    console.log('CONFIG: ', config);
  }

  /**
   * Удалить модель из списка по индексу
   */
  public async removeModel(event: Event, index: number) {
    event.stopPropagation();
    const condition = index >= 0 && index <= (this.models.length - 1);

    if (condition) {
      this.models.splice(index, 1);
    }
  }

  /**
   * Сохранить модель
   */
  public async saveModel(event: Event) {
    event.stopPropagation();
  }
}
