import { mkdir } from "node:fs/promises";
import { readdir } from "node:fs/promises";

const inputDir = "weinode/readjson/gs/data/json/wip/"
const outputDir = "000/"
// read all the files in the current directory, recursively
const files = await readdir(inputDir, { recursive: true });
for (const file of files){
    console.log(file.substring(7, 11))
    console.log(file.substring(8, 10))
    const folderName = file.substring(8, 10)
    
    const copyFile =  Bun.file(inputDir + file);
    await Bun.write(outputDir + "0" + folderName + "/" + file, copyFile);
    
    // await Bun.write("outputDir" + file, "weinode/readjson/gs/data/json/001/" + file);
    
}


// const file = Bun.file("README.md");
// await Bun.write(outputDir + "copy.txt", file);

// for(let i = 0; i < 50; i++) {
//     await mkdir("000/0" + i , { recursive: true });
// }

// const file = Bun.file("/path/to/original.txt");
// await Bun.write("/path/to/copy.txt", file);

// fs.readdir(inputDir, (err, files) => {
//     if (err) {
//       console.error("Error reading directory:", err);
//       return;
//     }
  
//     // Iterate over the files
//     files.forEach((file) => {
//       // Full path to the file
//       const filePath = path.join(inputDir, file);
//       console.log("process file = " + filePath);
  
//       // Read the JSON file
//       fs.readFile(filePath, "utf8", (err, data) => {
//         // console.log("hello");
  