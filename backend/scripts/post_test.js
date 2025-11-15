const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testNoImage(token) {
  const form = new FormData();
  form.append('title', 'NodeTestNoImage');
  form.append('ingredients', 'a\nb');
  form.append('steps', '1. x');

  const headers = Object.assign({ Authorization: `Bearer ${token}` }, form.getHeaders());

  try {
    const res = await axios.post('http://localhost:3001/recipe/create', form, { headers });
    console.log('NoImage response:', res.data);
  } catch (err) {
    if (err.response) console.error('NoImage error:', err.response.status, err.response.data);
    else console.error(err.message);
  }
}

async function testWithImage(token) {
  const form = new FormData();
  form.append('title', 'NodeTestWithImage');
  form.append('ingredients', 'a\nb');
  form.append('steps', '1. x');
  form.append('image', fs.createReadStream(__dirname + '/sample.jpg'));

  const headers = Object.assign({ Authorization: `Bearer ${token}` }, form.getHeaders());

  try {
    const res = await axios.post('http://localhost:3001/recipe/create', form, { headers });
    console.log('WithImage response:', res.data);
  } catch (err) {
    if (err.response) console.error('WithImage error:', err.response.status, err.response.data);
    else console.error(err.message);
  }
}

const token = process.argv[2] || '';
if (!token) {
  console.error('Usage: node post_test.js <TOKEN>');
  process.exit(1);
}

(async () => {
  await testNoImage(token);
  // sample.jpg optional; skip if not exists
  if (fs.existsSync(__dirname + '/sample.jpg')) {
    await testWithImage(token);
  } else {
    console.log('Skipping image test (no sample.jpg in scripts/)');
  }
})();
