import { OpenAIEmbeddings } from "@langchain/openai"

class EmbeddingModel{

    #size;
    #model;

    constructor(baseURL, size){
        this.#size = size;
        this.#model = new OpenAIEmbeddings({
            openAIApiKey: "lm-studios",
            configuration: { baseURL: baseURL }
        });
    }

    get size(){
        return this.#size;
    }

    async getEmbedding(query){
        try{
            let embedding = await this.#model.embedQuery(query);
            return embedding;
        }catch(e){
            console.error(e);
        }
    }

}

export {
    EmbeddingModel
}