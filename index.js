import minimist from "minimist";

import { generate } from "./src/reportGenerator.js";

const parsedArgs = minimist(process.argv.slice(2));

generate(parsedArgs);
