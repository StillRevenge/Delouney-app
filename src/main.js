const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true
        }
    });

    mainWindow.setMenuBarVisibility(false);
    mainWindow.setTitle('LandBuild');
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
};
let modelWindow;

function createModelWindow() {
    modelWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true
        }
    });

    modelWindow.loadFile(path.join(__dirname, 'model.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('open-model-window', (_event, fileName) => {
    createModelWindow();
    modelWindow.webContents.send('file-path', fileName);
});
ipcMain.on('hey-open-my-dialog-now', () => {
    dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] }).then(result => {

        //Get Selected Folders
        folderpath = result.filePaths;
        console.log(folderpath[0]);
        mainWindow.webContents.send('dir-path', folderpath);
    });
});
