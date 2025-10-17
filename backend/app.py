from flask import Flask, request

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("data", methods=['POST'])
def data():
    bytes = request.get_data()
    