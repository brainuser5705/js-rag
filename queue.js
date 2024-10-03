import { Queue } from "bullmq";

export const redisOptions = { host: "localhost", port: 6379 };

export const queueName = "uploadQueue"

const uploadQueue = new Queue(queueName, { connection: redisOptions });

async function addJob(job){
  await uploadQueue.add(job.name, job.data);
}

export const uploadDocument = (job) => {

  console.log("Uploading document", job.data.filepath, "at", Date.now());

  // setTimeout(() => {
  //   console.log("Finished uploading document", job.filepath, "at", Date.now());
  // }, 3000);

}

export const addNewFiles = (files) => {
  files.forEach(file => {
    addJob({
      name: "uploadDocument",
      data: {
        filepath: file
      }
    });
  });
}
