const path = require('path');
const { copyFile, mkdir, readdir, stat, unlink } = require('fs/promises');

const src = path.join(__dirname, 'files');
const dest = path.join(__dirname, 'files-copy');

async function copyDir() {
    try {
        let statCopy = await stat(dest);
        if (statCopy.isDirectory()) {
            for (const file of (await readdir(dest)).values()) {
                unlink(path.join(dest, file), err => { if (err) throw err });
            }
            copyFiles(src, dest);
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            await mkdir(dest);
            copyFiles(src, dest);
        }
    }
}

async function copyFiles(from, to) {
    let stats = await stat(from);
    if (stats.isDirectory()) {
        for (const file of (await readdir(from)).values()) {
            await copyFile(path.join(from, file), path.join(to, file));
        }
    }
}

copyDir();