import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NeuralNetworkConfig } from '@cross-nn/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-model-editor',
  templateUrl: './model-editor.component.html',
  styleUrls: ['./model-editor.component.scss']
})
export class ModelEditorComponent implements OnInit {
  public readonly INPUT_SIZE = 784;
  public readonly OUTPUT_SIZE = 10;
  public configForm: FormGroup;

  get HIDDEN(): FormControl | null {
    return !Boolean(this.configForm)
      ? null
      : this.configForm.get('HIDDEN') as FormControl;
  }

  get LR(): FormControl | null {
    return !Boolean(this.configForm)
      ? null
      : this.configForm.get('LR') as FormControl;
  }

  get MOMENT(): FormControl | null {
    return !Boolean(this.configForm)
      ? null
      : this.configForm.get('MOMENT') as FormControl;
  }

  constructor(
    private dialogRef: MatDialogRef<ModelEditorComponent, NeuralNetworkConfig>,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.configForm = this.fb.group({
      HIDDEN: [100, [Validators.required, Validators.min(1)]],
      LR: [0.3, []],
      MOMENT: [0, []]
    });
  }

  save() {
    const {HIDDEN, LR, MOMENT} = this.configForm.value;
    const config: NeuralNetworkConfig = {
      neuronCounts: [this.INPUT_SIZE, HIDDEN, this.OUTPUT_SIZE]
    };

    if (typeof LR === 'number' && !isNaN(LR)) {
      config.learningRate = LR;
    }

    if (typeof MOMENT === 'number' && !isNaN(MOMENT)) {
      config.moment = MOMENT;
    }

    this.dialogRef.close(config);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
