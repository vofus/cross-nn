import { WorkerTaskStatus } from './worker-task-status.enum';

export interface WorkerTask<T = any> {
	id: string;
	status: WorkerTaskStatus;
	message: T;
}
