import { Queue } from "bullmq";
import { Unstructured } from "./models/unstructured.js";
import { Qdrant } from "./models/qdrant.js"
import { EmbeddingModel } from "./models/embedding.js";

import dotenv from "dotenv";
dotenv.config();

export const redisOptions = { host: process.env.HOST, port: 6379 };
export const queueName = "uploadQueue"

const uploadQueue = new Queue(queueName, { connection: redisOptions });

const UNSTRUCTURED_API_KEY = process.env.UNSTRUCTURED_API_KEY;
const LM_STUDIOS_SERVER_URL = process.env.LM_STUDIOS_SERVER_URL;

var unstructured = new Unstructured(UNSTRUCTURED_API_KEY);
var embeddingModel = new EmbeddingModel(LM_STUDIOS_SERVER_URL);
var qdrant = new Qdrant(embeddingModel);

const UPLOAD_DIR = "data/";

const COLLECTION_NAME = "test";


async function addJob(job){
  await uploadQueue.add(job.name, job.data, { removeOnComplete: true, removeOnFail: true });
}


export const uploadDocument = async (job) => {

  // Partition the document
  let filepath = job.data.filepath;
  console.log("===\tIngesting document", filepath);
  let chunks = await unstructured.ingest_document(UPLOAD_DIR + filepath);
  console.log(`===\tFinished ingesting document ${filepath}`);

  // Create collection
  let created_collection = await qdrant.create_collection_if_not_exists(COLLECTION_NAME);

  // Put chunks in collection
  if (created_collection){
    chunks.forEach(async (chunk) => {
      try{
        await qdrant.insert_chunk(COLLECTION_NAME, chunk);
        console.log(`Inserted ${chunk.id} into Qdrant`);
      }catch(e){
        console.log(`Could not insert chunk ${chunk.id} into Qdrant: ${e}`);
      }
    });
  }

}


export const addNewFiles = async (files) => {

  await uploadQueue.drain(true);

  files.forEach(file => {
    addJob({
      name: "uploadDocument",
      data: {
        filepath: file
      }
    });
  });
}
