import { WorkerTask } from './worker-task.interface';
import { guid } from '../utils';
import { WorkerTaskStatus } from './worker-task-status.enum';

export function workerTaskCreator<T = any>(message: T): WorkerTask<T> {
	return {
		id: guid(),
		status: WorkerTaskStatus.WAITING,
		message
	};
}
