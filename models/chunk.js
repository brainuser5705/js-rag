class Chunk{

    #id;
    #text;
    #filepath;

    constructor(id, text, filepath){
        this.#id = id;
        this.#text = text;
        this.#filepath = filepath;
    }

    get id(){
        return this.#id;
    }

    get text(){
        return this.#text;
    }

    set text(newText){
        this.#text = newText;
    }

    get filepath(){
        this.#filepath;
    }

    toJSON() {
        return {
            id: this.#id,
            text: this.#text,
            filepath: this.#filepath
        };
    }

    toString(){
        return `{id: ${this.#id}, text: ${this.#text}, filepath: ${this.#filepath}}`;
    }

}

export {
    Chunk
}