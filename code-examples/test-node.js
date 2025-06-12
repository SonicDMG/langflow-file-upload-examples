// Node.js example using axios, form-data, and fs
// 1. Import required modules
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// 2. Prepare the form data with the file to upload
const data = new FormData();
data.append('file', fs.createReadStream('fake_resume.txt'));

// 3. Upload the file to Langflow
axios.post('http://127.0.0.1:7860/api/v2/files/', data, {
  headers: {
    ...data.getHeaders(),
  }
})
.then(res => {
  // 4. Get the uploaded file path from the response
  const uploadedPath = res.data.file_path || res.data.path;
  // 5. Call the Langflow run endpoint with the uploaded file path
  return axios.post('http://127.0.0.1:7860/api/v1/run/file-only', {
    tweaks: {
      'File-VMznN': {
        path: uploadedPath
      }
    }
  });
})
.then(res => {
  // 6. Print the final response
  console.log(res.data);
})
.catch(err => {
  // 7. Handle errors
  console.error(err);
});

