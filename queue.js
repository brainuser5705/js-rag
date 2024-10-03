import { Queue } from "bullmq";
import { Unstructured } from "./models/unstructured.js";
import dotenv from "dotenv";
dotenv.config();

export const redisOptions = { host: "localhost", port: 6379 };
export const queueName = "uploadQueue"

const uploadQueue = new Queue(queueName, { connection: redisOptions });

const UNSTRUCTURED_API_KEY = process.env.UNSTRUCTURED_API_KEY;
var unstructured = new Unstructured(UNSTRUCTURED_API_KEY);

const UPLOAD_DIR = "C:\\Users\\codeu\\Documents\\afrl\\rag-js\\data\\";

async function addJob(job){
  await uploadQueue.add(job.name, job.data, { removeOnComplete: true, removeOnFail: true });
}

export const uploadDocument = async (job) => {

  let filepath = job.data.filepath;

  console.log("Ingesting document", filepath);

  let response = await unstructured.ingest_document(UPLOAD_DIR + filepath);

  console.log(`Finished ingesting document ${filepath} with response: ${response}`);
  
}

export const addNewFiles = async (files) => {
  await uploadQueue.drain();
  files.forEach(file => {
    addJob({
      name: "uploadDocument",
      data: {
        filepath: file
      }
    });
  });
}
