import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlgorithmListItem, ModelTrainingResponse } from '@shared/model-training/types';
import { LearningGradAlgorithm } from '@cross-nn/core';

@Component({
  selector: 'app-model-training',
  templateUrl: './model-training.component.html',
  styleUrls: ['./model-training.component.scss']
})
export class ModelTrainingComponent implements OnInit {
  public readonly ALGORITHMS: AlgorithmListItem[] = [
    {id: LearningGradAlgorithm.BACK_PROP, name: 'Error back propagation'},
    {id: LearningGradAlgorithm.BACK_PROP_WITH_MOMENT, name: 'Error back propagation with moment'}
  ];
  public configForm: FormGroup;

  get ALGORITHM(): FormControl | null {
    return !Boolean(this.configForm)
      ? null
      : this.configForm.get('ALGORITHM') as FormControl;
  }

  get TRAIN_SET(): FormControl | null {
    return !Boolean(this.configForm)
      ? null
      : this.configForm.get('TRAIN_SET') as FormControl;
  }

  get EPOCHS(): FormControl | null {
    return !Boolean(this.configForm)
      ? null
      : this.configForm.get('EPOCHS') as FormControl;
  }

  constructor(
    private dialogRef: MatDialogRef<ModelTrainingComponent, ModelTrainingResponse>,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.configForm = this.fb.group({
      ALGORITHM: [null, [Validators.required]],
      TRAIN_SET: [10, [Validators.required, Validators.min(1)]],
      EPOCHS: [10, [Validators.required, Validators.min(1)]]
    });
  }

  save() {
    const {ALGORITHM, TRAIN_SET, EPOCHS} = this.configForm.value;

    this.dialogRef.close({
      algorithm: ALGORITHM,
      trainingSetSize: TRAIN_SET,
      epochs: EPOCHS
    });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
