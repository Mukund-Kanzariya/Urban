const http = require('http');

http.get('http://localhost:5000/api/categories', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
});
