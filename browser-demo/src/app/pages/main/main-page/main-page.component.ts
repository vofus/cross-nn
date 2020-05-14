import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BrowserAdapter } from '@cross-nn/browser';
import { MnistService } from '@core/mnist/mnist.service';
import { NeuralNetwork, TrainItem } from '@cross-nn/core';
import { ModelEditorService } from '@shared/model-editor/model-editor.service';
import { ModelTrainingService } from '@shared/model-training/model-training.service';
import { NnModelItem, RecognitionResult, AutoTestResult } from './types';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  private readonly WORKER_URL = 'workers/cross-nn.worker.js';
  private nnAdapter: BrowserAdapter = null;
  public threadsConfig = {
    count: 1,
    changed: false
  };

  public autoTestCount = 50;
  public autoTestResults: AutoTestResult[] = [];
  public recognition: RecognitionResult = {
    digit: null,
    percent: null
  };

  public models: NnModelItem[] = [];
  public selectedModel: NnModelItem = null;
  public selectedTabIndex = 0;
  public displayedColumns = ['digit', 'percent'];

  constructor(
    private sanitizer: DomSanitizer,
    private mnist: MnistService,
    private modelEditor: ModelEditorService,
    private modelTraining: ModelTrainingService
  ) { }

  ngOnInit(): void {
    this.updateBrowserAdapter();
  }

  /**
   * Установить количество потоков
   */
  public setThreadCount(count: number) {
    this.threadsConfig.changed = true;
    this.threadsConfig.count = typeof count === 'number'
      && !isNaN(count)
      && count > 0
      ? count
      : 1;
  }

  /**
   * Обновить объект адаптера
   */
  public updateBrowserAdapter() {
    if (Boolean(this.nnAdapter)) {
      this.nnAdapter.terminate();
    }

    this.threadsConfig.changed = false;
    this.nnAdapter = new BrowserAdapter(this.WORKER_URL, this.threadsConfig.count);
  }

  /**
   * Добавить новую модель нейронной сети
   */
  public async createNewModel() {
    try {
      const config = await this.modelEditor.open().toPromise();

      if (Boolean(config)) {
        const model = new NeuralNetwork(config);

        this.models.push({
          model,
          config,
          progress: 0,
          downloadURL: null
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Загрузить нейронную сеть из файла
   */
  public async loadModel(event: Event) {
    try {
      const model = await this.nnAdapter.loadNeuralNetwork(event.target as HTMLInputElement);

      if (Boolean(model)) {
        this.models.push({
          model,
          config: null,
          progress: 0,
          downloadURL: null
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Настроить тренировку нейронной сети
   */
  public async trainModel(event: Event, nnModel: NnModelItem) {
    event.stopPropagation();

    try {
      const { algorithm, epochs, trainingSetSize } = await this.modelTraining.open().toPromise();
      const trainingSet = this.mnist.getTrainSet(trainingSetSize);
      const progressReporter = ({ epochNumber }) => {
        nnModel.progress = Math.ceil((epochNumber / epochs) * 100);
      };

      const model = await this.nnAdapter.gradAlgorithmTrainAsync(
        nnModel.model,
        algorithm,
        trainingSet,
        epochs,
        progressReporter
      );

      const downloadURL = await this.nnAdapter.saveNeuralNetwork(model);

      nnModel.model = model;
      nnModel.downloadURL = this.sanitizer.bypassSecurityTrustUrl(downloadURL);
    } catch (err) {
      console.error(err);
      nnModel.progress = 0;
    }
  }

  /**
   * Удалить модель из списка по индексу
   */
  public removeModel(event: Event, index: number) {
    event.stopPropagation();

    try {
      const condition = index >= 0 && index <= (this.models.length - 1);

      if (condition) {
        const [removedModel] = this.models.splice(index, 1);

        if (this.selectedModel === removedModel) {
          this.selectedModel = null;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Выбрать модель нейронной сети
   */
  public selectModel(model: NnModelItem) {
    this.selectedModel = this.selectedModel === model ? null : model;
  }

  /**
   * Сохранить модель
   */
  public saveModel(event: Event) {
    event.stopPropagation();
  }

  public autoTest() {
    if (Boolean(this.selectedModel) && Boolean(this.selectedModel.model)) {
      const recognizer = this.getRecognitionResult(this.selectedModel.model);

      this.autoTestResults = this.mnist.getTestSets(this.autoTestCount)
        .map((trainSet, digit) => {
          let recognized = 0;
          const results = trainSet.map((t: TrainItem) => {
            const result = recognizer(t.inputs);

            if (result.digit === digit) {
              ++recognized;
            }

            return result;
          });

          return {
            digit,
            results,
            percent: Math.round((recognized / trainSet.length) * 10000) / 100
          };
        });
    }
  }

  /**
   * Распознать изображение
   */
  public recognizeImage(imageData: number[]) {
    if (Boolean(this.selectedModel) && Boolean(this.selectedModel.model)) {
      this.recognition = this.getRecognitionResult(this.selectedModel.model)(imageData);
    }
  }

  /**
   * Сбросить данные о распознанном изображении
   */
  public resetRecognitionData() {
    this.recognition = {
      digit: null,
      percent: null
    };
  }

  /**
   * Получить индекс максимального значения
   */
  private getMaxIndex(result: number[][]): number {
    return result.reduce((res, [item], i) => item > result[res][0] ? i : res, 0);
  }

  /**
   * Получить результат распознования
   */
  private getRecognitionResult(nn: NeuralNetwork) {
    return (inputs: number[]): RecognitionResult => {
      const result = nn.query(inputs).toArray();
      const index = this.getMaxIndex(result);
      const percent = Math.round(result[index][0] * 100);

      return {
        digit: index,
        percent: percent
      };
    };
  }
}
