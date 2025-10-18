# Handle incoming requests
from flask import Flask, request, Response, jsonify
import tempfile
from analysis import feedback
from instance import Instance, Instances

app = Flask(__name__)
instances = Instances()

@app.route("/")
def home():
    return "Home"

@app.route("/process", methods=['POST'])
def process():
    '''user posts video data for analysis. returns instance id and starts processing'''
    bytes = request.get_data()
    instance = Instance(bytes, instances)
    id = instance.get_id()
    instance.start()
    return jsonify({'id': id})

@app.route("/status/<id>")
def status(id):
    '''get status of instance id. if done, includes result'''
    instance = instances.get_instance(id)
    if instance is None:
        return jsonify({'error': 'id not found'})
    status = instance.get_status()
    if status['done']:
        status['result'] = instance.get_result()
    return jsonify(status)