const path = require('path');
const { readdir } = require('fs/promises');
const { createReadStream, writeFile, appendFile } = require('fs');

async function joinCss() {
    try {
        const src = path.join(__dirname, 'styles');
        const dist = path.join(__dirname, 'project-dist', 'bundle.css');
        writeFile(dist, '', (error) => {
            if (error) return console.error(error.message);
        });

        const files = await readdir(src.toString(), {withFileTypes: true});
        for (const file of files) {
            if(file.isFile() && path.extname(file.name) == '.css') {
                let data = '';
                const stream = createReadStream(path.join(__dirname, 'styles', file.name));
                stream.on('data', chunk => data += chunk);
                stream.on('end', () => 
                    appendFile(dist, data, (err) => {
                        if(err) reject(err);
                    })
                );
            }
        }
    } catch (err) {
        console.error(err);
    }
}

joinCss();