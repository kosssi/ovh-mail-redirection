const {app, BrowserWindow, Tray} = require('electron')
const isDev = require('electron-is-dev')

// Check which environment is running. Dev / Prod
if (isDev) {
  console.log('Running in development')
    // Reload the app upon detecting saved changes.
  require('electron-reload')(__dirname)
} else {
  console.log('Running in production')
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let windowParams = {
  width: 900,
  height: 600,
  resizable: false,
  show: false,
  frame: false,
  transparent: true
}
let tray

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow(windowParams)

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)
  // mainWindow.setProgressBar(-1); // hack: force icon refresh
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show()
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()

  tray = new Tray(`${__dirname}/assets/img/omr.png`)
  tray.setToolTip('Ovh Mail Redirection')
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    } else {
      createWindow()
    }
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
