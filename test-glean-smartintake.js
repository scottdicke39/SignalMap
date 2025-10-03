// Test Glean API connection for SmartIntake AI
import 'dotenv/config';
import fetch from 'node-fetch';

const GLEAN_BASE_URL = process.env.GLEAN_BASE_URL;
const GLEAN_API_KEY = process.env.GLEAN_API_KEY;

console.log('🧪 Testing Glean API for SmartIntake AI\n');
console.log(`Base URL: ${GLEAN_BASE_URL}`);
console.log(`API Key: ${GLEAN_API_KEY ? GLEAN_API_KEY.substring(0, 20) + '...' : 'NOT SET'}\n`);

async function testGleanSearch() {
  try {
    console.log('1️⃣  Testing general search...');
    
    const response = await fetch(`${GLEAN_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLEAN_API_KEY}`
      },
      body: JSON.stringify({
        query: 'test',
        pageSize: 1
      })
    });

    if (!response.ok) {
      console.log(`❌ Search failed: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ Search successful! Results:`, JSON.stringify(data, null, 2).substring(0, 300));
    return true;
  } catch (error) {
    console.error('❌ Search error:', error.message);
    return false;
  }
}

async function testGleanPeopleSearch() {
  try {
    console.log('\n2️⃣  Testing people search for "Katherine Kelly"...');
    
    const response = await fetch(`${GLEAN_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLEAN_API_KEY}`
      },
      body: JSON.stringify({
        query: 'Katherine Kelly',
        pageSize: 5,
        datasources: ['PEOPLE'],
        requestOptions: {
          datasourceFilter: ['PEOPLE']
        }
      })
    });

    if (!response.ok) {
      console.log(`❌ People search failed: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ People search successful!`);
    console.log(`Results:`, JSON.stringify(data, null, 2).substring(0, 500));
    return true;
  } catch (error) {
    console.error('❌ People search error:', error.message);
    return false;
  }
}

async function runTests() {
  if (!GLEAN_BASE_URL || !GLEAN_API_KEY) {
    console.error('❌ Missing Glean configuration in .env file');
    process.exit(1);
  }

  const test1 = await testGleanSearch();
  const test2 = await testGleanPeopleSearch();

  console.log('\n' + '='.repeat(50));
  if (test1 && test2) {
    console.log('✅ ALL TESTS PASSED! Glean is ready for SmartIntake AI');
  } else {
    console.log('⚠️  Some tests failed. SmartIntake will use fallback data.');
  }
  console.log('='.repeat(50));
}

runTests();

