import { WorkerThreadStatus } from './worker-thread-status.enum';

export interface WorkerThread {
	worker: Worker;
	status: WorkerThreadStatus;
}
