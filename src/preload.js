const { contextBridge, ipcRenderer, app } = require('electron');
const path = require('path');
const fs = require('fs');
const { type } = require('os');
let faf;
const getFilePath = (fileName, dirPath) => path.join(dirPath, fileName);
contextBridge.exposeInMainWorld('electron', {
    getFileNames: (dirPath) => {
        let files = fs.readdirSync(dirPath)
            .map(fileName => fileName);
        return files.join('\n');
    },
    readFile: (fileName, dirPath) => {
        let fileText = fs.readFileSync(getFilePath(fileName, dirPath), 'utf8');
        return fileText;
    },
    createFile: (fileName, dirPath) => {
        let fileTitle = getFilePath(fileName, dirPath);
        fs.writeFileSync(`${fileTitle}.json`, '');
    },
    writeFile: (fileName, fileText, dirPath) => fs.writeFileSync(getFilePath(fileName, dirPath), fileText),
    deleteFile: (fileName, dirPath) => fs.unlinkSync(getFilePath(fileName, dirPath)),
    rend: (fileName) => {
        console.log(fileName);
        ipcRenderer.send('open-model-window', fileName);
    },
    readjson: (filepath) => {
        return fs.readFileSync(filepath, 'utf8');
    },
    getPath: (fileName, dirPath) => {
        return getFilePath(fileName, dirPath);
    },
    getFile: (callback) => ipcRenderer.on('file-path', (_event, value) => callback(value)),
    openDialog: async () => {
        const result = ipcRenderer.send('hey-open-my-dialog-now');
        console.warn(typeof (result));
        return result;
    },
    getFolder: (callback) => ipcRenderer.on('dir-path', (_event, value) => callback(value)),

});

