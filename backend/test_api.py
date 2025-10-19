import requests
import time
from dotenv import load_dotenv
import os

load_dotenv()
HOST = 'http://127.0.0.1:5000'
# HOST = os.getenv('HOST')

def test():
    with open('sample/iphone.mov', 'rb') as file:
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