const express = require('express');

const app = express();

app.use(express.static('./dist/browser-demo'));

app.get('/*', (req, res) =>
    res.sendFile('index.html', {root: 'dist/browser-demo/'}),
);

app.listen(process.env.PORT || 8080);