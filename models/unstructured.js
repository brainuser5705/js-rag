import { UnstructuredClient } from "unstructured-client";
// import { PartitionResponse } from "unstructured-client/sdk/models/operations/index.js";
import { Strategy } from "unstructured-client/sdk/models/shared/index.js";
import fs from "fs";

import { Chunk } from "./chunk.js";


class Unstructured{

    #client;

    constructor(key){
        this.client = new UnstructuredClient({
            serverURL: "https://api.unstructured.io/general/v0/general",
            security: {
                apiKeyAuth: key,
            },
        });
    }


    ingest_document(filepath){
        return new Promise((resolve, reject) => {

            console.log("Reading file from", filepath);

            try{
                var data = fs.readFileSync(filepath);
            }catch (e) {
                reject(e);
            }

            let chunks = [];
            this.client.general.partition({
                partitionParameters: {
                    files: {
                        content: data,
                        fileName: filepath
                    }
                },
                strategy: Strategy.Auto,
            }).then((response) => {
                if (response.statusCode == 200){

                    response.elements.forEach((element) => {
                        chunks.push(new Chunk(
                            element.element_id,
                            element.text,
                            element.metadata.filename
                        ));
                    });

                    resolve(chunks);
                }
            }).catch((e) => {
                reject(e);
            });

        });
    }
    
}

export {
    Unstructured
};