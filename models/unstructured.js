import { UnstructuredClient } from "unstructured-client";
// import { PartitionResponse } from "unstructured-client/sdk/models/operations/index.js";
import { Strategy } from "unstructured-client/sdk/models/shared/index.js";
import fs from "fs";


class Unstructured{

    constructor(key){
        console.log(key);
        this.client = new UnstructuredClient({
            serverURL: "https://api.unstructured.io/general/v0/general",
            security: {
                apiKeyAuth: key,
            },
        });
    }


    ingest_document(filepath){
        return new Promise((resolve, reject) => {

            console.log("reading file from", filepath);

            try{
                var data = fs.readFileSync(filepath);
            }catch (error) {
                reject("Failed");
            }

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
                    resolve(response.elements);
                }
            }).catch((e) => {
                reject("Failed");
            });

        });
    }
    
}

export {
    Unstructured
};