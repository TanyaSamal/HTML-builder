const path = require('path');
const { readdir } = require('fs/promises');
const { stat } = require('fs');
let folder = path.join(__dirname, 'secret-folder').toString();

async function getFiles() {
    try {
        const files = await readdir(folder, {withFileTypes: true});
        for (const file of files) {
            if(file.isFile()) {
                stat(path.join(__dirname, 'secret-folder', file.name), function (err, stats) {
                    let ext = path.extname(file.name).slice(1);
                    let filename = file.name.slice(0, file.name.lastIndexOf('.'));
                    console.log(`${filename} - ${ext} - ${stats.size/1000}kb`);
                });  
            }
        }
    } catch (err) {
        console.error(err);
    }
}

getFiles();
