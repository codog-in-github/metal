const { resolve } = require('path');
const { app } = require('electron');
const isPa = app.isPackaged;

const distDir = isPa ? resolve(process.resourcesPath, 'app.asar.unpacked/dist') : null;

const preloadJs = isPa
  ? resolve(distDir, 'preload.js')
  : resolve(__dirname, '../public/preload.js');

const dbDir = isPa 
  ? resolve(process.resourcesPath, 'app.asar.unpacked/db')
  : resolve(__dirname, '../db');

module.exports = {
  preloadJs,
  distDir,
  dbDir
};