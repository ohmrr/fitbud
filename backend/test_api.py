import requests
import time

HOST = 'http://127.0.0.1:5000'

def test():
    with open('sample/squat.mp4', 'rb') as file:
        data = file.read()
        response = requests.post(f'{HOST}/process', data)
        result = response.json()
        id = result['id']
        print(id)

    while True:
        time.sleep(0.5)
        response = requests.get(f'{HOST}/status/{id}')
        result = response.json()
        if 'error' in result:
            print(result['error'])
            break
        if result['done']:
            print(result['result']['feedback'])
            break
        else:
            print(result['status'])

if __name__ == '__main__':
    test()