// app.ts
import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Hello, World! This is a TypeScript app running on Google Cloud Run.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
