import requests, json

API = "http://127.0.0.1:8000/api/v1"

r = requests.post(f"{API}/auth/login/", json={"username": "admin", "password": "admin123"})
print("login status:", r.status_code)
if r.status_code != 200:
    print(r.text); exit()
    
token = r.json()["access"]
headers = {"Authorization": f"Bearer {token}"}

r = requests.get(f"{API}/admin-dashboard/", headers=headers)
print("admin-dashboard status:", r.status_code)
print(r.text[:1000])
