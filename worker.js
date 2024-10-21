import { Worker } from "bullmq";
import { 
  addFile,
  unstructuredHandler,
  qdrantHandler,
  parentQueueName,
  redisOptions,
  unstructuredQueueName,
  qdrantQueueName
} from "./queue.js";

const jobHandlers = {
  addFile: addFile,
  unstructured: unstructuredHandler,
  qdrant: qdrantHandler
};

// job handlers for each step and parent

const processJob = async (job) => {
  const handler = jobHandlers[job.name];

  if (handler){
    return await handler(job);
  }

};

const qdrantWorker = new Worker(qdrantQueueName, processJob, { connection: redisOptions });
const unstructuredWorker = new Worker(unstructuredQueueName, processJob, { connection: redisOptions });

const parentWorker = new Worker(parentQueueName, processJob, { connection: redisOptions });

qdrantWorker.on("completed", (job) => {
  console.log(`Child ${job.name} has completed!`);
});

qdrantWorker.on("failed", (job, err) => {
  console.log(`Child ${job.name} has failed with ${err.message}`);
});

unstructuredWorker.on("completed", (job) => {
  console.log(`Child ${job.name} has completed!`);
});

unstructuredWorker.on("failed", (job, err) => {
  console.log(`Child ${job.name} has failed with ${err.message}`);
});

parentWorker.on("completed", (job) => {
  console.log(`Parent ${job.name} has completed!`);
});

parentWorker.on("failed", (job, err) => {
  console.log(`Parent ${job.name} has failed with ${err.message}`);
});

console.log("Worker started!");