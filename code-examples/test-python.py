# Python example using requests
import requests

# 1. Set the upload URL
url = "http://127.0.0.1:7860/api/v2/files/"

# 2. Prepare the file and payload
payload = {}
files = [
  ('file', ('fake_resume.txt', open('fake_resume.txt', 'rb'), 'application/octet-stream'))
]
headers = {
  'Accept': 'application/json'
}

# 3. Upload the file to Langflow
response = requests.request("POST", url, headers=headers, data=payload, files=files)

# 4. Print the response
print(response.text)

