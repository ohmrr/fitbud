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
    '''user posts video data for analysis. returns instance id and starts processing'''
    bytes = request.get_data()
    instance = Instance(bytes)
    id = instance.get_id()
    instance.start()
    return id

@app.route("/status/<id>")
def status(id):
    '''get status of instance id. if done, includes result'''
    instance = get_instance(id)
    status = instance.get_status()
    if status['done']:
        status['result'] = instance.get_result()
    return jsonify(status)