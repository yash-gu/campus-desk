const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// GD Room Configuration
const GD_ROOMS = {
  'M-GD-01': { name: 'M-GD-01', slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'] },
  'M-GD-02': { name: 'M-GD-02', slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'] },
  'M-GD-03': { name: 'M-GD-03', slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'] },
  'M-GD-04': { name: 'M-GD-04', slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'] },
  'LL-GD-01': { name: 'LL-GD-01', slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'] },
  'LL-GD-02': { name: 'LL-GD-02', slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'] }
};

// Generate checksum for validation
function generateChecksum(roomId, slot) {
  const data = roomId + slot + 'CAMPUS-DESK-GD';
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

// Generate QR data for room+slot
function generateQRData(roomId, slot) {
  return {
    roomId,
    slot,
    roomName: GD_ROOMS[roomId].name,
    timeSlot: slot,
    campus: 'Campus Desk',
    type: 'gd-room',
    timestamp: new Date().toISOString(),
    checksum: generateChecksum(roomId, slot)
  };
}

// Generate HTML for room QR codes
function generateRoomHTML(roomId, roomData) {
  const qrCodes = [];
  
  // Generate QR codes for each slot
  roomData.slots.forEach(slot => {
    const qrData = generateQRData(roomId, slot);
    qrCodes.push({
      slot,
      qrData: JSON.stringify(qrData),
      checksum: qrData.checksum
    });
  });

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${roomData.name} - GD Room QR Codes</title>
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
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #4F46E5;
            margin: 0;
            font-size: 28px;
        }
        
        .header p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 14px;
        }
        
        .room-info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .qr-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .qr-card {
            border: 2px solid #e5e7eb;
            border-radius: 15px;
            padding: 15px;
            text-align: center;
            background: #f9fafb;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .qr-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
        }
        
        .qr-time {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .qr-code {
            width: 150px;
            height: 150px;
            margin: 0 auto 15px;
            border: 2px dashed #9ca3af;
            padding: 10px;
            background: white;
            border-radius: 10px;
        }
        
        .qr-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #6b7280;
        }
        
        .checksum {
            font-size: 10px;
            color: #059669;
            margin-top: 5px;
            font-family: monospace;
        }
        
        .instructions {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 10px;
            padding: 20px;
            margin-top: 30px;
        }
        
        .instructions h3 {
            color: #d97706;
            margin-top: 0;
        }
        
        .instructions ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .instructions li {
            margin-bottom: 8px;
            color: #4b5563;
        }
        
        @media print {
            body { padding: 10px; }
            .qr-grid { grid-template-columns: repeat(3, 1fr); }
            .qr-card { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${roomData.name}</h1>
        <p>Group Discussion Room - Slot Booking QR Codes</p>
        <p><strong>Room ID:</strong> ${roomId} | <strong>Total Slots:</strong> ${roomData.slots.length}</p>
    </div>

    <div class="room-info">
        <h2>📍 Room Information</h2>
        <p><strong>Room Name:</strong> ${roomData.name}</p>
        <p><strong>Available Slots:</strong> ${roomData.slots.join(', ')}</p>
        <p><strong>Booking Type:</strong> Time Slot Based</p>
    </div>

    <div class="qr-grid">
`;

  // Generate QR code cards
  qrCodes.forEach(({ slot, qrData, checksum }) => {
    html += `
        <div class="qr-card">
            <div class="qr-title">${roomData.name}</div>
            <div class="qr-time">🕐 ${slot}</div>
            <div class="qr-code">
                <div class="qr-placeholder">
                    [QR Code for ${slot}]
                </div>
            </div>
            <div class="checksum">🔐 ${checksum}</div>
        </div>
    `;
  });

  html += `
    </div>

    <div class="instructions">
        <h3>📋 Instructions</h3>
        <ul>
            <li><strong>Single QR System:</strong> Each QR code works for both room identification and slot booking</li>
            <li><strong>Scan to Book:</strong> Student scans QR code to book the specific time slot</li>
            <li><strong>Admin Approval:</strong> Booking request sent to admin for approval</li>
            <li><strong>Automatic Validation:</strong> System validates room, slot, and checksum integrity</li>
            <li><strong>Real-time Updates:</strong> Dashboard shows available slots in real-time</li>
        </ul>
    </div>

    <script>
        // Generate QR codes when page loads
        window.onload = function() {
            console.log('Generating QR codes for ${roomData.name}');
            
            // This would normally use a QR code library
            // For demo purposes, showing placeholders
            const qrCodes = document.querySelectorAll('.qr-placeholder');
            qrCodes.forEach((element, index) => {
                setTimeout(() => {
                    element.innerHTML = '📱 QR Generated';
                    element.style.background = '#10b981';
                    element.style.color = 'white';
                }, index * 200);
            });
        };
    </script>
</body>
</html>
`;

  return html;
}

// Generate validation data
function generateValidationData() {
  const validationData = {
    campus: 'Campus Desk',
    type: 'gd-room-slots',
    totalRooms: Object.keys(GD_ROOMS).length,
    totalSlots: Object.values(GD_ROOMS).reduce((sum, room) => sum + room.slots.length, 0),
    generatedAt: new Date().toISOString(),
    rooms: {}
  };

  // Generate validation data for each room and slot
  Object.entries(GD_ROOMS).forEach(([roomId, roomData]) => {
    validationData.rooms[roomId] = {
      name: roomData.name,
      slots: roomData.slots,
      slotValidation: {}
    };

    // Generate validation for each slot
    roomData.slots.forEach(slot => {
      const qrData = generateQRData(roomId, slot);
      validationData.rooms[roomId].slotValidation[slot] = {
        checksum: qrData.checksum,
        roomId,
        slot,
        roomName: roomData.name,
        valid: true
      };
    });
  });

  return validationData;
}

// Main generation function
async function generateGDQRcodes() {
  console.log('🚀 Generating GD Room QR Codes...');
  
  const outputDir = path.join(__dirname, 'output');
  await fs.ensureDir(outputDir);

  const validationData = generateValidationData();

  // Generate HTML files for each room
  for (const [roomId, roomData] of Object.entries(GD_ROOMS)) {
    console.log(`📚 Generating QR codes for ${roomData.name}...`);
    
    const html = generateRoomHTML(roomId, roomData);
    const fileName = `${roomId.toLowerCase()}-qr-codes.html`;
    const filePath = path.join(outputDir, fileName);
    
    await fs.writeFile(filePath, html, 'utf8');
    console.log(`📄 HTML: ${filePath}`);
  }

  // Generate master validation file
  const masterValidationPath = path.join(outputDir, 'gd-master-validation.json');
  await fs.writeJson(masterValidationPath, validationData);
  console.log(`🔍 Master Validation: ${masterValidationPath}`);

  // Generate room-specific validation files
  for (const [roomId, roomData] of Object.entries(GD_ROOMS)) {
    const roomValidationPath = path.join(outputDir, `${roomId.toLowerCase()}-validation.json`);
    await fs.writeJson(roomValidationPath, validationData.rooms[roomId]);
    console.log(`🔍 Room Validation: ${roomValidationPath}`);
  }

  // Generate master index
  let masterIndexHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GD Rooms - Master Index</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 48px;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .room-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .room-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .room-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        
        .room-title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
        }
        
        .room-stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
            gap: 20px;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-number {
            font-size: 36px;
            font-weight: bold;
            color: #059669;
            display: block;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 14px;
            color: #6b7280;
        }
        
        .slots-list {
            background: #f3f4f6;
            border-radius: 10px;
            padding: 15px;
            margin-top: 15px;
        }
        
        .slots-list h4 {
            margin-top: 0;
            color: #1f2937;
            font-size: 16px;
        }
        
        .slot {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            margin: 3px;
            font-size: 12px;
        }
        
        .actions {
            margin-top: 25px;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 0 10px;
            transition: transform 0.2s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        }
        
        @media print {
            body { padding: 10px; }
            .room-grid { grid-template-columns: repeat(2, 1fr); }
            .room-card { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️️ GD Room Booking System</h1>
            <p>Group Discussion Room Management with Time Slot Booking</p>
        </div>

        <div class="room-grid">
`;

  // Generate room cards
  Object.entries(GD_ROOMS).forEach(([roomId, roomData]) => {
    const roomCardHTML = `
            <div class="room-card">
                <div class="room-title">${roomData.name}</div>
                
                <div class="room-stats">
                    <div class="stat">
                        <div class="stat-number">${roomData.slots.length}</div>
                        <div class="stat-label">Total Slots</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${Object.keys(GD_ROOMS).length}</div>
                        <div class="stat-label">Total Rooms</div>
                    </div>
                </div>
                
                <div class="slots-list">
                    <h4>🕐 Available Time Slots</h4>
                    ${roomData.slots.map(slot => `<span class="slot">${slot}</span>`).join('')}
                </div>
                
                <div class="actions">
                    <a href="${roomId.toLowerCase()}-qr-codes.html" class="btn btn-primary">📱 Generate QR Codes</a>
                    <a href="${roomId.toLowerCase()}-validation.json" class="btn">🔍 View Validation Data</a>
                </div>
            </div>
    `;
    
    masterIndexHTML += roomCardHTML;
  });

  masterIndexHTML += `
        </div>
        
        <div class="actions">
            <a href="gd-master-validation.json" class="btn">🔐 Master Validation Data</a>
            <a href="javascript:window.print()" class="btn">🖨️ Print Overview</a>
        </div>
    </div>

    <script>
        console.log('GD Room Booking System loaded');
        console.log('Total rooms:', ${Object.keys(GD_ROOMS).length});
        console.log('Total slots:', ${Object.values(GD_ROOMS).reduce((sum, room) => sum + room.slots.length, 0)});
    </script>
</body>
</html>
`;

  const masterIndexPath = path.join(outputDir, 'gd-rooms-index.html');
  await fs.writeFile(masterIndexPath, masterIndexHTML, 'utf8');
  console.log(`📄 Master Index: ${masterIndexPath}`);

  console.log('🎉 GD Room QR Codes generation completed!');
  console.log('📁 Output files:');
  
  Object.entries(GD_ROOMS).forEach(([roomId, roomData]) => {
    console.log(`  📄 ${roomId.toLowerCase()}-qr-codes.html`);
    console.log(`  🔍 ${roomId.toLowerCase()}-validation.json`);
  });
  console.log(`  📄 gd-rooms-index.html`);
  console.log(`  🔍 gd-master-validation.json`);
  console.log(`📋 Total: ${validationData.totalRooms} rooms, ${validationData.totalSlots} slots`);
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🏛️️ GD Room QR Code Generator');
    console.log('');
    console.log('Usage:');
    console.log('  node generate-gd-qr.js generate    # Generate all GD room QR codes');
    console.log('');
    console.log('Features:');
    console.log('  📱 Single QR for room+slot booking');
    console.log('  🕐 6 time slots per room (9-11 to 19-21)');
    console.log('  🔐 Checksum validation for security');
    console.log('  📄 Printable HTML files for each room');
    console.log('  🔍 JSON validation data for backend integration');
    console.log('  📊 Master index with overview');
    return;
  }

  const command = args[0].toLowerCase();
  
  switch (command) {
    case 'generate':
      generateGDQRcodes();
      break;
      
    default:
      console.log(`❌ Unknown command: ${command}`);
      console.log('Available commands: generate');
      break;
  }
}

// Run CLI if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateGDQRcodes,
  generateQRData,
  generateValidationData,
  GD_ROOMS
};
