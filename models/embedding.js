import { OpenAIEmbeddings } from "@langchain/openai"

class EmbeddingModel{

    #model;

    constructor(baseURL){
        this.#model = new OpenAIEmbeddings({
            openAIApiKey: "lm-studios",
            configuration: { baseURL: baseURL }
        });
    }

    getEmbedding(query){
        let embedding = this.#model.embedQuery(query).then((response) => {return response;});
        return embedding;
    }

}

export {
    EmbeddingModel
}