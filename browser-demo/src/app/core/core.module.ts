import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MnistService } from '@core/mnist/mnist.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    MnistService
  ]
})
export class CoreModule { }
