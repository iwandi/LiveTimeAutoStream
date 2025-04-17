console.log("✅ Preload script loading ...");

const {} = require('./inject.js');
const {} = require('./livetime-to-obs.js');
const { connectToOBS } = require('./obs.js');

connectToOBS();

console.log("✅ Preload script loaded");