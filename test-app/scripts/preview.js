const express = require('express');
const app = express();
const port = 4173;

app.use(express.static('dist', {
    setHeaders: (response) => {
        response
            .setHeader("Cross-Origin-Embedder-Policy", "require-corp")
            .setHeader("Cross-Origin-Opener-Policy", "same-origin");
    }
}));

app.listen(port, () => {
    console.log(`Local: http://localhost:${port}`)
});