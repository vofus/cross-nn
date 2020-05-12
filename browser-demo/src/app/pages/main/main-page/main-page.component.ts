import { Component, OnInit } from '@angular/core';
// import { BrowserAdapter } from '@cross-nn/browser';
import { ModelEditorService } from '@shared/model-editor/model-editor.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  // private nnAdapter: BrowserAdapter = null;
  public threadsConfig = {
    count: 1,
    changed: false
  };

  public models = [
    {progress: 70},
    {progress: 50},
    {progress: 30},
    {progress: 70},
    {progress: 80},
    {progress: 60}
  ];

  constructor(private modelEditor: ModelEditorService) {
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
  }

  public async createNewModel() {
    await this.modelEditor.open(null).toPromise();
  }

  public async editModel(model: any) {
    await this.modelEditor.open(model).toPromise();
  }
}
