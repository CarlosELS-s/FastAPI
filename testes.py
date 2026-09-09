import requests

header= {
    "Authorization": "Bearer  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0IiwiZXhwIjoxNzg4OTkxNDAzfQ.q4mc11TbaeAuUsrYEOLwrmXfYNC42hCrPXJJae9yuQA"
}

requisiçao= requests.get("http://127.0.0.1:8000/auth/refresh", headers=header)
print(requisiçao)
print(requisiçao.text)