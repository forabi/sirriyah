const testContext = require.context(`${__dirname}/test`, true, /\.tsx?$/);
testContext.keys().forEach(testContext);

// const sourceContext = require.context('./src', true, /(?!\.test)\.tsx?$/);
// sourceContext.keys().forEach(sourceContext);
