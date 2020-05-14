import { RecognitionResult } from './recognition-result.interface';

export interface AutoTestResult {
    digit: number;
    percent: number;
    results: RecognitionResult[];
}