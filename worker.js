import { Worker } from "bullmq";
import { uploadDocument, queueName, redisOptions } from "./queue.js";

const jobHandlers = {
  uploadDocument: uploadDocument
};

const processJob = async (job) => {
  const handler = jobHandlers[job.name];

  if (handler){
    console.log(`Processing job: ${job.name}`);
    await handler(job);
    console.log("Finished processing");
  }

};

const worker = new Worker(queueName, processJob, { connection: redisOptions });

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});

console.log("Worker started!");