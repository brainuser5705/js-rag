import {QdrantClient} from '@qdrant/js-client-rest';


class Qdrant{

    #client;
    #embeddingModel;

    constructor(embeddingModel){
        this.#client = new QdrantClient({url: 'http://127.0.0.1:6333'});
        this.#embeddingModel = embeddingModel
    }

    async create_collection_if_not_exists(collection_name){

        try{
            let exist = await this.#client.collectionExists(collection_name).then((res) => {
                return res["exists"];
            });
    
            if (!exist){
                console.log(`Creating collection ${collection_name}`);
                await this.#client.createCollection(collection_name, {
                    vectors: {
                        size: 384,
                        distance: 'Dot'
                    }
                });
                console.log(`Created collection ${collection_name}`);
            }else{
                console.log(`Collection ${collection_name} already exists, moving on...`);
            }
            
            return true;
        }catch{
            console.log(`Something went wrong when creating collection: ${e}`);
            return false;
        }

    }

    insert_chunk(collection_name, chunk){

        return new Promise((resolve, reject) => {
            let chunkPointStruct = {
                id: chunk.id,
                vector: this.#embeddingModel.getEmbedding(chunk.text), // embedding,
                payload: {
                    text: chunk.text,
                    filepath: chunk.filepath
                }
            }
    
            try{
                this.#client.upsert(
                    collection_name,
                    {
                        wait: true,
                        points: [ chunkPointStruct ]
                    }
                )
                resolve("Passed");
            }catch(e){
                reject(e);
            }
        });

    }

    query_point(collection_name, query){

        return new Promise(async (resolve, reject) => {

            try{
                let hits = await this.#client.search(collection_name, {
                    vector: this.#embeddingModel.getEmbedding(query),
                    limit: 3
                });
                resolve(hits);
            }catch(e){
                reject(e);
            }
        });

    }

}

export {
    Qdrant
}
