# Campus Desk - QR Code Generator & Validator

A comprehensive QR code generation and validation system for the Campus Desk library management system, supporting 1,320 seats across three zones.

## 🏗️ Overview

This system generates printable QR codes for all library seats with built-in validation and security features.

### Zones Supported
- **M-Block Library**: 1,010 seats (MB-0001 to MB-1010)
- **Law Library**: 205 seats (LL-0001 to LL-0205)  
- **Central Library**: 105 seats (CL-0001 to CL-0105)

## 🚀 Features

### QR Code Generation
- **Batch Generation**: Creates all 1,320 QR codes at once
- **Printable HTML**: A4-optimized layouts for printing
- **Unique Validation**: Each QR code contains checksum validation
- **Zone-Specific**: Color-coded by zone for easy identification
- **Position Data**: Includes row/column positioning

### Security & Validation
- **Checksum Verification**: Prevents QR code tampering
- **Zone Validation**: Ensures QR codes are used in correct zones
- **Format Validation**: Strict data format checking
- **Database Integration**: Validates against generated data
- **Anti-Fraud**: Multiple layers of validation

### Output Files
- **HTML Files**: Printable QR code sheets (4 per page)
- **JSON Data**: Validation data for backend integration
- **Master Index**: Overview of all zones
- **Validation Database**: Complete validation dataset

## 📦 Installation

```bash
cd printable-qr
npm install
```

## 🔧 Usage

### Generate QR Codes
```bash
npm run generate
```

This will create:
- `output/index.html` - Master index page
- `output/mblock-qr-codes.html` - M-Block QR codes (printable)
- `output/law-qr-codes.html` - Law Library QR codes (printable)
- `output/central-qr-codes.html` - Central Library QR codes (printable)
- `output/*-validation-data.json` - Validation data for each zone
- `output/master-validation.json` - Master validation file

### Validate QR Codes

#### Run Tests
```bash
npm run validate test
```

#### Interactive Validation
```bash
npm run validate interactive
```

#### Validate Specific QR Code
```bash
npm run validate '{"seatId":"MB-0001","zone":"M-Block","position":{"row":1,"col":1},"campus":"Campus Desk","checksum":"ABC12345"}'
```

#### Clean Output
```bash
npm run clean
```

## 📋 QR Code Data Structure

Each QR code contains:
```json
{
  "seatId": "MB-0001",
  "zone": "M-Block", 
  "position": {
    "row": 1,
    "col": 1
  },
  "campus": "Campus Desk",
  "timestamp": "2026-03-18T10:30:00.000Z",
  "checksum": "ABC12345"
}
```

## 🔍 Validation Rules

### Required Fields
- `seatId`: Format MB-XXXX, LL-XXXX, or CL-XXXX
- `zone`: Must be "M-Block", "Law", or "Central"
- `position`: Row and column coordinates
- `campus`: Must be "Campus Desk"
- `checksum`: 8-character hexadecimal checksum

### Validation Checks
1. **Format Validation**: JSON structure and required fields
2. **Zone Validation**: Zone exists and matches seat prefix
3. **Checksum Validation**: Prevents tampering
4. **Database Validation**: Exists in generated database
5. **Position Validation**: Row/column within zone bounds

## 🖨️ Printing Instructions

### For Each Zone:
1. Open the corresponding HTML file (`*-qr-codes.html`)
2. Print using A4 paper, portrait orientation
3. Cut out individual QR codes
4. Place at corresponding seat locations

### Printing Tips:
- Use high-quality printer for best QR code readability
- Ensure QR codes are at least 2cm x 2cm when printed
- Test scan a few codes before full printing
- Laminate for durability in high-traffic areas

## 🔧 Integration with Backend

### API Integration
The validation data can be integrated with your backend API:

```javascript
const { validateQRCodeAgainstDB } = require('./printable-qr/validate');

// In your booking API
app.post('/api/bookings/checkin', async (req, res) => {
  const { qrData } = req.body;
  
  const validation = await validateQRCodeAgainstDB(qrData);
  
  if (!validation.valid) {
    return res.status(400).json({ 
      error: validation.error 
    });
  }
  
  // Proceed with booking logic
  const { seatId, zone, position } = validation.data;
  // ... rest of booking logic
});
```

### Database Integration
Import validation data into MongoDB:

```javascript
const fs = require('fs');
const validationData = JSON.parse(fs.readFileSync('printable-qr/output/master-validation.json'));

// Create seats in MongoDB
for (const zone of validationData.zones) {
  const zoneData = JSON.parse(fs.readFileSync(`printable-qr/output/${zone.validationFile}`));
  
  for (const seat of zoneData.seats) {
    await Seat.create({
      seatId: seat.seatId,
      zone: zone.name,
      position: seat.position,
      checksum: seat.checksum,
      status: 'available'
    });
  }
}
```

## 🛡️ Security Features

### Checksum Algorithm
Each QR code contains a checksum generated from:
- Seat ID
- Zone name
- Secret salt ("CAMPUS-DESK")

This prevents:
- QR code tampering
- Cross-zone usage
- Counterfeit QR codes

### Validation Layers
1. **Client-side**: Basic format validation
2. **Server-side**: Full validation against database
3. **Checksum**: Cryptographic verification
4. **Zone**: Geographic/zone restrictions

## 📊 File Structure

```
printable-qr/
├── package.json              # Dependencies and scripts
├── generate.js               # QR code generation logic
├── validate.js               # Validation logic and CLI
├── README.md                 # This file
├── output/                   # Generated files
│   ├── index.html           # Master index
│   ├── master-validation.json # Master validation data
│   ├── mblock-qr-codes.html # M-Block printable QR codes
│   ├── mblock-validation-data.json # M-Block validation
│   ├── law-qr-codes.html    # Law Library printable QR codes
│   ├── law-validation-data.json # Law Library validation
│   ├── central-qr-codes.html # Central Library printable QR codes
│   └── central-validation-data.json # Central Library validation
└── utils/                    # Utility functions
```

## 🔄 Maintenance

### Regenerating QR Codes
If you need to regenerate QR codes (e.g., after adding new seats):

```bash
npm run clean
npm run generate
```

### Updating Validation
After regenerating, update your backend database with new validation data.

### Testing Validation
Always run validation tests after changes:

```bash
npm run validate test
```

## 🚨 Important Notes

- **Security**: Never share the validation data publicly
- **Backup**: Keep backup copies of generated files
- **Version Control**: Track changes to QR code generation
- **Testing**: Always test QR codes before full deployment
- **Printing**: Use high-quality printing for best results

## 📞 Support

For issues or questions:
1. Check the validation test results
2. Verify QR code format matches expected structure
3. Ensure all required fields are present
4. Test with the interactive validator

## 📈 Statistics

- **Total QR Codes**: 1,320
- **Zones**: 3
- **Seats per Zone**: 1,010 (M-Block), 205 (Law), 105 (Central)
- **Validation Rules**: 5+ layers of security
- **Output Files**: 7 files (HTML + JSON)
