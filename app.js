import fs from "fs";
import { addNewFiles } from "./queue.js";

// let files = fs.readdirSync("C:\\Users\\codeu\\Documents\\afrl\\rag-js\\data");
let files = fs.readdirSync("data/");
addNewFiles(files);