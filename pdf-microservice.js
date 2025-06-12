const express = require('express');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');

const app = express();
app.use(fileUpload());

app.post('/extract-text', async (req, res) => {
  if (!req.files || !req.files.pdf) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }
  try {
    const data = await pdfParse(req.files.pdf.data);
    res.json({ text: data.text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`PDF microservice running on port ${PORT}`));
