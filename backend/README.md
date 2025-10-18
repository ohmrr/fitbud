# Setup

- Create venv using `python -m venv .venv`
- Activate venv using `source .venv/bin/activate`
- Install dependencies using `pip install -r requirements.txt`
- If additional dependencies are added, run `pip freeze > requirements.txt` to save new requirements
- Run with `flask run`


# API Usage From Frontend
- Send POST request to `{host}/process` to start processing
    - returns json `{id: "XYZ"}`
- Send repeated GET requests to `{host}/status/{id}` to fetch status of the process
    - returns json `{done: false, status: "message"}`
    - when done: returns json `{done: true, result: {feedback: "..."}}`
- Currently there is little error detection so there may be weird results if there are errors
