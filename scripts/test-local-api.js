/**
 * Test the local API route to debug the 500 error
 */

async function testLocalAPI() {
  console.log('🔍 Testing local API route...\n');

  const testFilters = {
    propertyType: 'all',
    location: '',
    keywords: ''
  };

  try {
    console.log('Request:', JSON.stringify(testFilters, null, 2));
    console.log('\n📡 Calling local API...');

    const response = await fetch('http://localhost:3000/api/search-contractors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testFilters)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    const contentType = response.headers.get('content-type');
    console.log(`Content-Type: ${contentType}`);

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('\nResponse:', JSON.stringify(data, null, 2));

      if (data.leads) {
        console.log(`\n✅ Found ${data.leads.length} leads`);
      }
    } else {
      const text = await response.text();
      console.log('\nResponse (text):', text.substring(0, 500));
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

testLocalAPI();
