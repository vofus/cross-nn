import { Component, NgZone, OnInit } from '@angular/core';
import { BrowserAdapter } from '@cross-nn/browser';
import { ModelEditorService } from '@shared/model-editor/model-editor.service';
import { LearningGradAlgorithm, NeuralNetwork, NeuralNetworkConfig, TrainItem } from '@cross-nn/core';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  private nnAdapter: BrowserAdapter = null;
  public threadsConfig = {
    count: 1,
    changed: false
  };

  public models = [];

  constructor(private modelEditor: ModelEditorService, private ngZone: NgZone) {
  }

  ngOnInit(): void {
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
    // this.nnAdapter = new BrowserAdapter('/workers/cross-nn.worker.js', this.threadsConfig.count);
    // console.log('ADAPTER: ', this.nnAdapter);

    const adapter = new BrowserAdapter('workers/cross-nn.worker.js', this.threadsConfig.count);
    const epochCount = 50;

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
      this.models[i] = {progress: 0};

      adapter.gradAlgorithmTrainAsync(
        new NeuralNetwork(nnConfig),
        LearningGradAlgorithm.BACK_PROP,
        scaledTrainSet,
        epochCount,
        ({epochNumber, epochTime}) => {
          const percent = Math.ceil((epochNumber/epochCount) * 100);

          this.models[i] = {progress: percent};
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

  public async createNewModel() {
    await this.modelEditor.open(null).toPromise();
  }

  public async editModel(model: any) {
    await this.modelEditor.open(model).toPromise();
  }
}
