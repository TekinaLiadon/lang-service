const WORKER_COUNT = require('os').cpus().length - 1 || 1

type PendingTask = {
    resolve: (r: any) => void;
    reject: (e: any) => void;
};

let nextTaskId = 1;

class WorkerPool {
    workers: Worker[] = [];
    free: number[] = [];
    taskMap: Map<number, PendingTask> = new Map();

    constructor( size: number) {
        for (let i = 0; i < size; i++) {
            const worker = new Worker(new URL("./worker.ts", import.meta.url).href);
            worker.onmessage = (event: MessageEvent) => {
                const { id, result, error } = event.data;
                const task = this.taskMap.get(id);
                if (task) {
                    if (error) task.reject(error);
                    else task.resolve(result);
                    this.taskMap.delete(id);
                    this.free.push(i);
                }
            };
            this.workers.push(worker);
            this.free.push(i);
        }
    }

    async run(payload: unknown): Promise<any> {
        if (this.free.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return this.run(payload);
        }
        const id = nextTaskId++;
        const workerIdx = this.free.shift()!;
        return new Promise((resolve, reject) => {
            this.taskMap.set(id, { resolve, reject });
            this.workers[workerIdx].postMessage({ id, payload });
        });
    }
}

var pool;
export default () => {
    pool = new WorkerPool( WORKER_COUNT);
}

export async function processJsonCreateTask(payload: any) {
    return await pool.run(payload);
}