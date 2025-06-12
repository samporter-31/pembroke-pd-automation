const express = require('express');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  abortOnLimit: true,
  responseOnLimit: 'File size limit exceeded'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// PDF text extraction endpoint
app.post('/extract-text', async (req, res) => {
  console.log('PDF extraction request received');
  
  try {
    // Validation
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfFile = req.files.pdf;

    // Validate file type
    if (pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    console.log(`Processing PDF: ${pdfFile.name}, size: ${pdfFile.size} bytes`);

    // Extract text
    const data = await pdfParse(pdfFile.data);
    
    console.log(`Text extracted successfully: ${data.text.length} characters`);

    res.json({ 
      success: true,
      text: data.text,
      metadata: {
        pages: data.numpages,
        filename: pdfFile.name,
        size: pdfFile.size
      }
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process PDF',
      details: error.message
    });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`PDF microservice running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});