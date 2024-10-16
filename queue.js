import { FlowProducer, Queue } from "bullmq";
import { Unstructured } from "./models/unstructured.js";
import { Qdrant } from "./models/qdrant.js";
import { EmbeddingModel } from "./models/embedding.js";
import { Chunk } from "./models/chunk.js";

import dotenv from "dotenv";
dotenv.config();

export const redisOptions = { host: process.env.HOST, port: 6379 };
export const childrenQueueName = "stepsQueue";
export const parentQueueName = "uploadQueue";

const flowProducer = new FlowProducer();

const UNSTRUCTURED_API_KEY = process.env.UNSTRUCTURED_API_KEY;
const LM_STUDIOS_SERVER_URL = process.env.LM_STUDIOS_SERVER_URL;

var unstructured = new Unstructured(UNSTRUCTURED_API_KEY);
var embeddingModel = new EmbeddingModel(LM_STUDIOS_SERVER_URL);
var qdrant = new Qdrant(embeddingModel);

const UPLOAD_DIR = "data/";
const COLLECTION_NAME = "test";

const parentQueue = new Queue(parentQueueName);

async function updateParentData(parentId, key, value){
  try{
    let parentJob = await parentQueue.getJob(parentId);
    let parentData = parentJob.data;
    parentData[key] = value;
    await parentJob.updateData(parentData);
  }catch(e){
    console.log(e);
  }
}

async function getParentData(parentId){
  try{
    let parentJob = await parentQueue.getJob(parentId);
    return parentJob.data;
  }catch(e){
    console.log(e);
  }
}

export const addFile = async(job) => {
  console.log("Finished parent job");
}

export const unstructuredHandler = async(job) => {
  let filepath = job.data.filepath;
  console.log("===\tIngesting document", filepath);
  let chunks = await unstructured.ingest_document(UPLOAD_DIR + filepath);
  let chunkJsons = [];
  chunks.forEach((chunk) => {
    let json = JSON.stringify(chunk);
    chunkJsons.push(json);
  });
  // Putting chunk data into shared parent data for qdrant sibling job to use
  await updateParentData(job.parent.id, "unstructuredChunks", chunkJsons);
  console.log(`===\tFinished ingesting document ${filepath}`);
}

export const qdrantHandler = async (job) => {

  console.log("===\tInserting chunks into Qdrant");

  // Create collection
  let created_collection = await qdrant.create_collection_if_not_exists(COLLECTION_NAME);

  let parentData = await getParentData(job.parent.id);
  let chunkJsons = parentData.unstructuredChunks;
  
  // Put chunks in collection
  if (created_collection){
    chunkJsons.forEach(async (chunkJson) => {

      // convert to Chunk object
      let chunkObj = JSON.parse(chunkJson);
      let chunk = new Chunk(chunkObj.id, chunkObj.text, chunkObj.filepath);

      try{
        // insert into Qdrant
        await qdrant.insert_chunk(COLLECTION_NAME, chunk);
        console.log(`Inserted ${chunk.id} into Qdrant`);

      }catch(e){
        console.log(`Could not insert chunk ${chunk.id} into Qdrant: ${e}`);
      }

    });

  }

  console.log("===\tFinished inserting into Qdrant");
}

export const addNewFiles = async (files) => {

  files.forEach(async (file) => {
    await flowProducer.add ({
      name: 'addFile',
      queueName: parentQueueName,
      children: [
        { name: 'unstructured', data: {filepath: file}, queueName: childrenQueueName },
        { name: 'qdrant', queueName: childrenQueueName },
      ]
    });
  });

}