import { WorkerThreadStatus } from './worker-thread-status.enum';
import { WorkerTaskStatus } from './worker-task-status.enum';
import { WorkerThread } from './worker-thread.interface';
import { WorkerTask } from './worker-task.interface';
import { Subject } from '../subject';

export class WorkerPull {
	private taskQueue: WorkerTask[] = [];
	private workerThreads: WorkerThread[] = [];
	public messages = new Subject();

	constructor(workerUrl: string, size: number = 1) {
		this.initWorkerThreads(workerUrl, size);
	}

	/**
	 * Инициализировать пулл воркеров
	 */
	private initWorkerThreads(workerUrl: string, size: number = 1) {
		for (let i = 0; i < size; ++i) {
			const thread: WorkerThread = {
				worker: new Worker(workerUrl),
				status: WorkerThreadStatus.IDLE
			};

			thread.worker.onmessage = (e) => {
				const task: WorkerTask = e.data;
				this.messages.next(task);

				if (task.status === WorkerTaskStatus.COMPLETE) {
					thread.status = WorkerThreadStatus.IDLE;
					this.takeTaskFromQueue();
				}
			};

			thread.worker.onerror = (err) => {
				console.error(err);
				thread.status = WorkerThreadStatus.IDLE;
				this.takeTaskFromQueue();
			};

			this.workerThreads.push(thread);
		}
	}

	/**
	 * Поставить задачу в очередь
	 */
	public addTaskToQueue(task: WorkerTask) {
		this.taskQueue.push(task);
		this.takeTaskFromQueue();
	}

	/**
	 * Взять задачу на исполнение, если имеется свободный поток
	 */
	private takeTaskFromQueue() {
		// Найти свободный поток
		const idleThread = this.workerThreads
			.find((t) => t.status === WorkerThreadStatus.IDLE);

		if (!Boolean(idleThread)) {
			return;
		}

		// Взять задачу из очереди
		const task = this.taskQueue.shift();

		if (!Boolean(task)) {
			return;
		}

		task.status = WorkerTaskStatus.RUNNING;
		idleThread.status = WorkerThreadStatus.RUNNING;
		idleThread.worker.postMessage(task);
	}
}
