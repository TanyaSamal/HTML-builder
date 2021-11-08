const path = require('path');
const { copyFile, mkdir, readdir, rmdir } = require('fs/promises');
const { createReadStream, writeFile, appendFile, readFile } = require('fs');

async function joinCss() {
    try {
        const src = path.join(__dirname, 'styles');
        const dist = path.join(__dirname, 'project-dist', 'style.css');
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
                    appendFile(dist, data, (error) => {
                        if(error) console.error(error.message);
                    })
                );
            }
        }
    } catch (err) {
        console.error(err);
    }
}

async function copyAssets(src, dest) {
    try {
        const entries = await readdir(src, { withFileTypes : true });
        await mkdir(dest);  
        for(let entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if(entry.isDirectory()) {
                await copyAssets(srcPath, destPath);
            } else {
                await copyFile(srcPath, destPath);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function replaceTemplates() {
    try {
        await readFile(path.join(__dirname, 'template.html'), 'utf8', (err, data) => {
            if (err) throw err;
            let content = data.toString();
            const templateNames = getTemplates(content);
            const componentsPromices = [];
            templateNames.forEach((name) => {
                componentsPromices.push(
                    new Promise((resolve, reject) => {
                        readFile(path.join(__dirname, 'components', `${name}.html`),'utf-8', (err, innerData) => {
                            if (err) {
                                reject(err); 
                            }
                            else{
                                resolve(innerData);
                            }
                        });
                    })
                );
            });
            Promise.all(componentsPromices).then(values => {
                templateNames.forEach((name, idx) => {
                    content = content.replace(`{{${name}}}`, values[idx]);
                });
                appendFile(path.join(__dirname, 'project-dist', 'index.html'), content, (error) => {
                    if(error) console.error(error.message);
                })
            });
        });
    } catch (e) {
        console.error(e);
    };
}

function getTemplates(str) {
    const templateNames = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] == '{' && str[i + 1] == '{') {
            let lastPos = str.indexOf('}}', i);
            templateNames.push(str.slice(i + 2, lastPos));
        }
    }
    return templateNames;
}

async function build() {
    const copySrc = path.join(__dirname, 'assets');
    const copyDest = path.join(__dirname, 'project-dist', 'assets');
    const projectDist = path.join(__dirname, 'project-dist');
    try {
        await mkdir(projectDist);
        copyAssets(copySrc, copyDest);
        joinCss();
        replaceTemplates();
    } catch (err) {
        if (err.code === "EEXIST") {
            await rmdir(projectDist, { recursive: true }, (err) => {
                if (err) {
                    console.error(err);
                }
            });
            build(); 
        }
    }
}

build();