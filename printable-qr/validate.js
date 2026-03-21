const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// Validation functions
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

function validateQRCode(qrData, expectedZone = null) {
  try {
    const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    
    // Required fields validation
    const requiredFields = ['seatId', 'zone', 'position', 'campus', 'checksum'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }
    
    // Campus validation
    if (data.campus !== 'Campus Desk') {
      return { valid: false, error: 'Invalid campus identifier' };
    }
    
    // Zone validation
    const validZones = ['M-Block', 'Law', 'Central'];
    if (!validZones.includes(data.zone)) {
      return { valid: false, error: 'Invalid zone' };
    }
    
    // Zone-specific validation (if specified)
    if (expectedZone && data.zone !== expectedZone) {
      return { valid: false, error: `QR code zone mismatch. Expected: ${expectedZone}, Found: ${data.zone}` };
    }
    
    // Seat ID format validation
    const seatIdPattern = /^(MB|LL|CL)-\d{4}$/;
    if (!seatIdPattern.test(data.seatId)) {
      return { valid: false, error: 'Invalid seat ID format' };
    }
    
    // Zone prefix validation
    const zonePrefixes = {
      'M-Block': 'MB',
      'Law': 'LL',
      'Central': 'CL'
    };
    
    const expectedPrefix = zonePrefixes[data.zone];
    const actualPrefix = data.seatId.split('-')[0];
    
    if (actualPrefix !== expectedPrefix) {
      return { valid: false, error: `Seat ID prefix mismatch for zone ${data.zone}` };
    }
    
    // Checksum validation
    const expectedChecksum = generateChecksum(data.seatId, data.zone);
    if (data.checksum !== expectedChecksum) {
      return { valid: false, error: 'Invalid checksum - QR code may be tampered' };
    }
    
    // Position validation
    if (!data.position.row || !data.position.col) {
      return { valid: false, error: 'Invalid position data' };
    }
    
    return { 
      valid: true, 
      data: data,
      message: 'QR code validation successful' 
    };
    
  } catch (error) {
    return { valid: false, error: 'Invalid JSON format' };
  }
}

// Load validation data from files
async function loadValidationData() {
  try {
    const outputDir = path.join(__dirname, 'output');
    const masterFile = path.join(outputDir, 'master-validation.json');
    
    if (!(await fs.pathExists(masterFile))) {
      throw new Error('Master validation file not found. Run generate.js first.');
    }
    
    const masterData = await fs.readJson(masterFile);
    const validationData = {};
    
    // Load zone-specific validation data
    for (const zone of masterData.zones) {
      const zoneFile = path.join(outputDir, zone.validationFile);
      if (await fs.pathExists(zoneFile)) {
        const zoneData = await fs.readJson(zoneFile);
        validationData[zone.name] = zoneData;
      }
    }
    
    return { master: masterData, zones: validationData };
    
  } catch (error) {
    console.error('Error loading validation data:', error.message);
    throw error;
  }
}

// Validate QR code against database
async function validateQRCodeAgainstDB(qrData, zone = null) {
  try {
    const validationDB = await loadValidationData();
    const validation = validateQRCode(qrData, zone);
    
    if (!validation.valid) {
      return validation;
    }
    
    // Check if seat exists in our database
    const seatData = validation.data;
    const zoneData = validationDB.zones[seatData.zone];
    
    if (!zoneData) {
      return { valid: false, error: `Zone data not found: ${seatData.zone}` };
    }
    
    const seatRecord = zoneData.seats.find(seat => seat.seatId === seatData.seatId);
    
    if (!seatRecord) {
      return { valid: false, error: `Seat not found in database: ${seatData.seatId}` };
    }
    
    // Additional validation against stored data
    if (seatRecord.checksum !== seatData.checksum) {
      return { valid: false, error: 'Checksum mismatch with database' };
    }
    
    if (seatRecord.position.row !== seatData.position.row || 
        seatRecord.position.col !== seatData.position.col) {
      return { valid: false, error: 'Position mismatch with database' };
    }
    
    return { 
      valid: true, 
      data: seatData,
      database: seatRecord,
      message: 'QR code successfully validated against database' 
    };
    
  } catch (error) {
    return { valid: false, error: `Database validation failed: ${error.message}` };
  }
}

// Batch validation function
async function validateBatch(qrCodes, zone = null) {
  const results = [];
  
  for (const qrCode of qrCodes) {
    const result = await validateQRCodeAgainstDB(qrCode, zone);
    results.push({
      qrCode: typeof qrCode === 'string' ? qrCode.substring(0, 50) + '...' : 'object',
      valid: result.valid,
      error: result.error,
      seatId: result.data?.seatId || 'N/A'
    });
  }
  
  return results;
}

// Test validation function
async function runValidationTests() {
  console.log('🔍 Running QR Code Validation Tests...\n');
  
  try {
    // Load validation data
    const validationDB = await loadValidationData();
    console.log('✅ Validation data loaded successfully');
    
    // Test 1: Valid QR code
    console.log('\n📋 Test 1: Valid QR Code');
    const validQR = {
      seatId: 'MB-0001',
      zone: 'M-Block',
      position: { row: 1, col: 1 },
      campus: 'Campus Desk',
      checksum: generateChecksum('MB-0001', 'M-Block')
    };
    
    const result1 = await validateQRCodeAgainstDB(validQR);
    console.log(`Result: ${result1.valid ? '✅ PASS' : '❌ FAIL'} - ${result1.message || result1.error}`);
    
    // Test 2: Invalid checksum
    console.log('\n📋 Test 2: Invalid Checksum');
    const invalidChecksumQR = { ...validQR, checksum: 'INVALID123' };
    const result2 = await validateQRCodeAgainstDB(invalidChecksumQR);
    console.log(`Result: ${result2.valid ? '✅ PASS' : '❌ FAIL'} - ${result2.message || result2.error}`);
    
    // Test 3: Wrong zone
    console.log('\n📋 Test 3: Zone Mismatch');
    const wrongZoneQR = { ...validQR, zone: 'Law', seatId: 'LL-0001' };
    const result3 = await validateQRCodeAgainstDB(wrongZoneQR, 'M-Block');
    console.log(`Result: ${result3.valid ? '✅ PASS' : '❌ FAIL'} - ${result3.message || result3.error}`);
    
    // Test 4: Invalid format
    console.log('\n📋 Test 4: Invalid Format');
    const invalidFormatQR = 'invalid json string';
    const result4 = await validateQRCodeAgainstDB(invalidFormatQR);
    console.log(`Result: ${result4.valid ? '✅ PASS' : '❌ FAIL'} - ${result4.message || result4.error}`);
    
    // Test 5: Missing fields
    console.log('\n📋 Test 5: Missing Required Fields');
    const missingFieldsQR = { seatId: 'MB-0001' };
    const result5 = await validateQRCodeAgainstDB(missingFieldsQR);
    console.log(`Result: ${result5.valid ? '✅ PASS' : '❌ FAIL'} - ${result5.message || result5.error}`);
    
    // Summary
    const allResults = [result1, result2, result3, result4, result5];
    const passedTests = allResults.filter(r => !r.valid).length;
    const totalTests = allResults.length;
    
    console.log(`\n📊 Test Summary: ${totalTests - passedTests}/${totalTests} tests passed`);
    
    if (passedTests === 0) {
      console.log('🎉 All validation tests passed!');
    } else {
      console.log(`⚠️  ${passedTests} tests failed as expected (negative tests)`);
    }
    
  } catch (error) {
    console.error('❌ Validation tests failed:', error.message);
  }
}

// Interactive validation
async function validateInteractive() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('🔍 Interactive QR Code Validator');
  console.log('Enter QR code data (JSON format) or "exit" to quit:\n');
  
  const askForQRCode = () => {
    rl.question('QR Code> ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }
      
      try {
        const result = await validateQRCodeAgainstDB(input.trim());
        console.log(`\nResult: ${result.valid ? '✅ VALID' : '❌ INVALID'}`);
        console.log(`Message: ${result.message || result.error}`);
        
        if (result.valid) {
          console.log(`Seat ID: ${result.data.seatId}`);
          console.log(`Zone: ${result.data.zone}`);
          console.log(`Position: Row ${result.data.position.row}, Col ${result.data.position.col}`);
        }
        
        console.log('\nEnter next QR code or "exit" to quit:\n');
        askForQRCode();
        
      } catch (error) {
        console.error(`❌ Validation error: ${error.message}\n`);
        askForQRCode();
      }
    });
  };
  
  askForQRCode();
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔍 Campus Desk QR Code Validator');
    console.log('\nUsage:');
    console.log('  node validate.js test          - Run validation tests');
    console.log('  node validate.js interactive   - Interactive validation mode');
    console.log('  node validate.js "<qr_data>"  - Validate specific QR code');
    console.log('\nExample:');
    console.log('  node validate.js \'{"seatId":"MB-0001","zone":"M-Block","position":{"row":1,"col":1},"campus":"Campus Desk","checksum":"ABC12345"}\'');
    return;
  }
  
  const command = args[0].toLowerCase();
  
  switch (command) {
    case 'test':
      runValidationTests();
      break;
      
    case 'interactive':
      validateInteractive();
      break;
      
    default:
      // Validate the provided QR code
      validateQRCodeAgainstDB(args[0])
        .then(result => {
          console.log(`Result: ${result.valid ? '✅ VALID' : '❌ INVALID'}`);
          console.log(`Message: ${result.message || result.error}`);
          
          if (result.valid) {
            console.log(`Seat ID: ${result.data.seatId}`);
            console.log(`Zone: ${result.data.zone}`);
            console.log(`Position: Row ${result.data.position.row}, Col ${result.data.position.col}`);
          }
        })
        .catch(error => {
          console.error('❌ Validation failed:', error.message);
        });
  }
}

// Export functions for use in other modules
module.exports = {
  validateQRCode,
  validateQRCodeAgainstDB,
  validateBatch,
  loadValidationData,
  generateChecksum,
  runValidationTests
};

// Run CLI if called directly
if (require.main === module) {
  main();
}
