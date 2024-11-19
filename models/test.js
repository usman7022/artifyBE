const express = require('express');
const JsBarcode = require('jsbarcode');
const fs = require('fs');
app.use('/barcodes', express.static('barcodes'));

app.post('/generate-barcode', (req, res) => {
  const data = req.body;
  const uniqueIdentifier = Date.now();
  const barcodeType = 'CODE128';
  const barcode = document.createElement('canvas');
  JsBarcode(barcode, JSON.stringify({ ...data, uniqueIdentifier }), {
    format: barcodeType, // Barcode type (e.g., 'CODE128')
    width: 2, // Width of the barcode lines
    height: 40, // Height of the barcode
  });

  // Convert the barcode to a data URL
  const barcodeDataURL = barcode.toDataURL('image/png');

  // Save the barcode image to a file
  const imagePath = `./barcodes/${uniqueIdentifier}.png`;
  const base64Data = barcodeDataURL.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(imagePath, base64Data, 'base64');

  // Send the image path to the frontend
  res.send({ barcodeImagePath: imagePath });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
