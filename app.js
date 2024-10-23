import fs from "fs";
import { addNewFiles } from "./queue.js";

let files = fs.readdirSync("data/");
addNewFiles(files).then(() => {
    console.log("Documents have been ingested by Unstructured and uploaded into Qdrant.");
});

// let query = prompt("What would you like to prompt the AI?");
