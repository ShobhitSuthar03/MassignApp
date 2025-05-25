import requests

url = "http://127.0.0.1:8000/generate-ifc"
data = {
    "spaces": [
        {
            "name": "Room 1",
            "boundary": [[0, 0], [4, 0], [4, 6], [0, 6]],
            "height": 3
        },
        {
            "name": "Room 2",
            "boundary": [[4, 0], [10, 0], [10, 6], [4, 6]],
            "height": 3
        }
    ]
}

response = requests.post(url, json=data)
if response.status_code == 200:
    with open("test_building.ifc", "wb") as f:
        f.write(response.content)
    print("IFC file saved as test_building.ifc")
else:
    print("Error:", response.status_code, response.text)