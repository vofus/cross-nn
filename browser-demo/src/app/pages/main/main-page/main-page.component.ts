import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BrowserAdapter } from '@cross-nn/browser';
import { MnistService } from '@core/mnist/mnist.service';
import { NeuralNetwork } from '@cross-nn/core';
import { ModelEditorService } from '@shared/model-editor/model-editor.service';
import { ModelTrainingService } from '@shared/model-training/model-training.service';
import { NnModelItem } from './types';

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

  public recognition = {
    number: null,
    percent: null
  };

  public models: NnModelItem[] = [];
  public selectedModel: NnModelItem = null;

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
      const {algorithm, epochs, trainingSetSize} = await this.modelTraining.open().toPromise();
      const trainingSet = this.mnist.getTrainSet(trainingSetSize);
      const progressReporter = ({epochNumber}) => {
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

  /**
   * Распознать изображение
   */
  public recognizeImage(imageData: number[]) {
    if (Boolean(this.selectedModel) && Boolean(this.selectedModel.model)) {
      const recognition = this.selectedModel.model.query(imageData);
      const arr = recognition.toArray();
      const index = this.getMaxIndex(arr);
      const percent = Math.round(arr[index][0] * 100);

      this.recognition = {
        number: index,
        percent: percent
      };
    }
  }

  /**
   * Сбросить данные о распознанном изображении
   */
  public resetRecognitionData() {
    this.recognition = {
      number: null,
      percent: null
    };
  }

  /**
   * Получить индекс максимального значения
   */
  private getMaxIndex(result: number[][]): number {
    return result.reduce((res, [item], i) => item > result[res][0] ? i : res, 0);
  }
}
