import { Worker, Queue } from "bullmq";
import { addFile, unstructuredHandler, qdrantHandler, parentQueueName, childrenQueueName, redisOptions } from "./queue.js";

const jobHandlers = {
  // uploadDocument: uploadDocument,
  addFile: addFile,
  unstructured: unstructuredHandler,
  qdrant: qdrantHandler
};

// job handlers for each step and parent

const processJob = async (job) => {
  const handler = jobHandlers[job.name];

  if (handler){
    await handler(job);
  }

};

const childrenWorker = new Worker(childrenQueueName, processJob, { connection: redisOptions });
const parentWorker = new Worker(parentQueueName, processJob, { connection: redisOptions });

childrenWorker.on("completed", (job) => {
  console.log(`Child ${job.name} has completed!`);
});

childrenWorker.on("failed", (job, err) => {
  console.log(`Child ${job.name} has failed with ${err.message}`);
});

// childrenWorker.on("progress", (job, progress) => {
//   let parentQueue = new Queue(parentQueueName);
//   let parentJob = parentQueue.getJob(job.parent.id);
//   parentJob.data = progress;
//   console.log(parentJob);
//   console.log(parentJob.name + ": "+ parentJob.data);
//   console.log(`Progress is: ${progress}`);
// });

parentWorker.on("completed", (job) => {
  console.log(`Parent ${job.name} has completed!`);
});

parentWorker.on("failed", (job, err) => {
  console.log(`Parent ${job.name} has failed with ${err.message}`);
});

console.log("Worker started!");