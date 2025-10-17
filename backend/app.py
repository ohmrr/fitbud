# Handle incoming requests
from flask import Flask, request, Response, jsonify
import tempfile
from analysis import feedback
from instance import Instance, get_instance

app = Flask(__name__)

@app.route("/")
def home():
    return "Home"

@app.route("/process", methods=['POST'])
def process():
    bytes = request.get_data()
    instance = Instance(bytes)
    id = instance.get_id()
    instance.start()
    return id

@app.route("/status/<id>")
def status(id):
    instance = get_instance(id)
    status = instance.get_status()
    if status['status'] == 'Finished':
        status['result'] = instance.get_result()
    return jsonify(status)