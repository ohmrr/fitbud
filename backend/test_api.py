import requests
import time

# HOST = 'http://127.0.0.1:5000'
HOST = 'https://fitbud-m7tj.onrender.com'

def test():
    with open('sample/squat.mp4', 'rb') as file:
        data = file.read()
        response = requests.post(f'{HOST}/process', data)
        result = response.json()
        id = result['id']
        print(id)

    while True:
        time.sleep(1)
        response = requests.get(f'{HOST}/status/{id}')
        if not response: continue
        if response.status_code != 200: continue
        result = response.json()
        if 'error' in result:
            print(result['error'])
        if result['done']:
            print(result['result']['feedback'])
            break
        else:
            print(result['status'])

if __name__ == '__main__':
    test()