const QRCode = require('qrcode');
const fs = require('fs-extra');
const path = require('path');

// Zone configuration
const zones = [
  {
    name: 'M-Block',
    count: 1010,
    prefix: 'MB',
    color: '#4F46E5', // Indigo
    cols: 20
  },
  {
    name: 'Law',
    count: 205,
    prefix: 'LL',
    color: '#7C3AED', // Purple
    cols: 15
  },
  {
    name: 'Central',
    count: 105,
    prefix: 'CL',
    color: '#059669', // Emerald
    cols: 15
  }
];

// QR code data template
function generateQRData(seatId, zone, position) {
  return {
    seatId: seatId,
    zone: zone,
    position: position,
    campus: 'Campus Desk',
    building: zone + ' Library',
    timestamp: new Date().toISOString(),
    checksum: generateChecksum(seatId, zone)
  };
}

// Generate checksum for validation
function generateChecksum(seatId, zone) {
  const data = seatId + zone + 'CAMPUS-DESK';
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

// Generate HTML template for printable QR codes
function generateHTMLTemplate(zone, seats) {
  const rows = Math.ceil(seats.length / 4); // 4 QR codes per row
  
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${zone.name} Library - QR Codes</title>
    <style>
        @page {
            size: A4;
            margin: 1cm;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid ${zone.color};
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: ${zone.color};
            margin: 0;
            font-size: 28px;
        }
        
        .header p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 14px;
        }
        
        .qr-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .qr-item {
            text-align: center;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            background: white;
            page-break-inside: avoid;
        }
        
        .qr-item:hover {
            border-color: ${zone.color};
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .qr-code {
            width: 120px;
            height: 120px;
            margin: 0 auto 10px;
        }
        
        .seat-id {
            font-size: 18px;
            font-weight: bold;
            color: ${zone.color};
            margin: 8px 0;
        }
        
        .zone-info {
            font-size: 12px;
            color: #666;
            margin: 4px 0;
        }
        
        .checksum {
            font-size: 10px;
            color: #999;
            font-family: monospace;
            margin-top: 8px;
        }
        
        .instructions {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 12px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #666;
            font-size: 12px;
        }
        
        @media print {
            .qr-item {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${zone.name} Library</h1>
        <p>Campus Desk - Seat QR Codes (${seats.length} seats)</p>
        <p>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
    </div>
    
    <div class="instructions">
        <strong>Instructions:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Print this page and place QR codes at corresponding seat locations</li>
            <li>Each QR code contains unique validation data</li>
            <li>Students scan QR codes to check-in to seats</li>
            <li>QR codes are zone-specific and cannot be used across zones</li>
        </ul>
    </div>
`;

  // Generate QR code items
  for (let i = 0; i < seats.length; i++) {
    const seat = seats[i];
    const qrData = JSON.stringify(seat.data);
    const qrDataUrl = `data:image/png;base64,${seat.qrBuffer}`;
    
    html += `
    <div class="qr-item">
        <img src="${qrDataUrl}" alt="QR Code for ${seat.seatId}" class="qr-code">
        <div class="seat-id">${seat.seatId}</div>
        <div class="zone-info">Zone: ${zone.name}</div>
        <div class="zone-info">Position: Row ${seat.position.row}, Col ${seat.position.col}</div>
        <div class="checksum">Checksum: ${seat.data.checksum}</div>
    </div>`;
  }

  html += `
    <div class="footer">
        <p>Campus Desk Library Management System</p>
        <p>Total seats: ${seats.length} | Zone: ${zone.name}</p>
        <p>This document contains ${seats.length} unique QR codes</p>
    </div>
</body>
</html>`;

  return html;
}

// Main generation function
async function generateQRCodes() {
  console.log('🚀 Generating QR codes for Campus Desk...');
  
  try {
    // Ensure output directory exists
    await fs.ensureDir(path.join(__dirname, 'output'));
    
    // Generate QR codes for each zone
    for (const zone of zones) {
      console.log(`\n📚 Processing ${zone.name} Library (${zone.count} seats)...`);
      
      const seats = [];
      
      // Generate seats for this zone
      for (let i = 1; i <= zone.count; i++) {
        const seatId = `${zone.prefix}-${String(i).padStart(4, '0')}`;
        const cols = zone.cols;
        const row = Math.ceil(i / cols);
        const col = ((i - 1) % cols) + 1;
        
        const position = { row, col };
        const qrData = generateQRData(seatId, zone.name, position);
        
        // Generate QR code
        const qrBuffer = await QRCode.toBuffer(JSON.stringify(qrData), {
          errorCorrectionLevel: 'H',
          type: 'png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 200
        });
        
        seats.push({
          seatId,
          position,
          data: qrData,
          qrBuffer: qrBuffer.toString('base64')
        });
        
        if (i % 100 === 0) {
          console.log(`  Generated ${i}/${zone.count} QR codes...`);
        }
      }
      
      // Generate HTML file for this zone
      const html = generateHTMLTemplate(zone, seats);
      const htmlPath = path.join(__dirname, 'output', `${zone.name.toLowerCase().replace('-', '')}-qr-codes.html`);
      await fs.writeFile(htmlPath, html);
      
      // Generate JSON data file for validation
      const jsonData = {
        zone: zone.name,
        totalSeats: zone.count,
        seats: seats.map(seat => ({
          seatId: seat.seatId,
          position: seat.position,
          checksum: seat.data.checksum,
          qrData: seat.data
        })),
        generatedAt: new Date().toISOString()
      };
      
      const jsonPath = path.join(__dirname, 'output', `${zone.name.toLowerCase().replace('-', '')}-validation-data.json`);
      await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));
      
      console.log(`  ✅ ${zone.name}: Generated ${seats.length} QR codes`);
      console.log(`  📄 HTML: ${htmlPath}`);
      console.log(`  🔍 Validation: ${jsonPath}`);
    }
    
    // Generate master index file
    const indexHTML = generateIndexHTML();
    await fs.writeFile(path.join(__dirname, 'output', 'index.html'), indexHTML);
    
    // Generate master validation file
    const masterValidation = generateMasterValidation();
    await fs.writeFile(path.join(__dirname, 'output', 'master-validation.json'), masterValidation);
    
    console.log('\n🎉 QR Code generation completed!');
    console.log('\n📁 Output files:');
    console.log('  📄 index.html - Master index page');
    console.log('  🔍 master-validation.json - Master validation data');
    console.log('  📁 Zone-specific HTML and JSON files');
    
    console.log('\n📋 Next steps:');
    console.log('  1. Open output/index.html in browser to preview');
    console.log('  2. Print HTML files for each zone');
    console.log('  3. Place QR codes at corresponding seat locations');
    console.log('  4. Use validation data for backend verification');
    
  } catch (error) {
    console.error('❌ Error generating QR codes:', error);
    process.exit(1);
  }
}

// Generate master index HTML
function generateIndexHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campus Desk - QR Codes Index</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8fafc;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            color: #1e293b;
            margin: 0;
            font-size: 32px;
        }
        .zones-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .zone-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        }
        .zone-card:hover {
            transform: translateY(-2px);
        }
        .zone-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 8px 0;
        }
        .zone-stats {
            color: #64748b;
            margin: 8px 0;
        }
        .zone-links {
            margin-top: 16px;
        }
        .btn {
            display: inline-block;
            padding: 8px 16px;
            margin: 4px;
            text-decoration: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
        }
        .btn-primary {
            background: #4f46e5;
            color: white;
        }
        .btn-secondary {
            background: #64748b;
            color: white;
        }
        .summary {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .summary h2 {
            margin: 0 0 16px 0;
            color: #1e293b;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏛️ Campus Desk - QR Codes</h1>
        <p>Library Seat Management System - Printable QR Codes</p>
        <p>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
    </div>
    
    <div class="zones-grid">
        ${zones.map(zone => `
        <div class="zone-card">
            <div class="zone-title" style="color: ${zone.color}">${zone.name} Library</div>
            <div class="zone-stats">📚 ${zone.count} seats</div>
            <div class="zone-stats">📐 ${zone.cols} columns × ${Math.ceil(zone.count / zone.cols)} rows</div>
            <div class="zone-links">
                <a href="${zone.name.toLowerCase().replace('-', '')}-qr-codes.html" class="btn btn-primary">📄 Print QR Codes</a>
                <a href="${zone.name.toLowerCase().replace('-', '')}-validation-data.json" class="btn btn-secondary">🔍 Validation Data</a>
            </div>
        </div>
        `).join('')}
    </div>
    
    <div class="summary">
        <h2>📊 Summary</h2>
        <p><strong>Total Seats:</strong> ${zones.reduce((sum, zone) => sum + zone.count, 0)}</p>
        <p><strong>Total Zones:</strong> ${zones.length}</p>
        <p><strong>QR Codes Generated:</strong> ${zones.reduce((sum, zone) => sum + zone.count, 0)}</p>
        <p><strong>Validation Files:</strong> ${zones.length + 1} (1 master + ${zones.length} zone-specific)</p>
    </div>
</body>
</html>`;
}

// Generate master validation data
function generateMasterValidation() {
  const masterData = {
    campus: 'Campus Desk',
    generatedAt: new Date().toISOString(),
    totalSeats: zones.reduce((sum, zone) => sum + zone.count, 0),
    totalZones: zones.length,
    zones: zones.map(zone => ({
      name: zone.name,
      prefix: zone.prefix,
      count: zone.count,
      color: zone.color,
      cols: zone.cols,
      validationFile: `${zone.name.toLowerCase().replace('-', '')}-validation-data.json`
    })),
    validationRules: {
      checksumRequired: true,
      zoneSpecific: true,
      caseInsensitive: false,
      formatValidation: true
    }
  };
  
  return JSON.stringify(masterData, null, 2);
}

// Run the generator
if (require.main === module) {
  generateQRCodes();
}

module.exports = { generateQRCodes, generateQRData, generateChecksum };
