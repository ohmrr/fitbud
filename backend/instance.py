# runs the entire process from reading video to generating feedback

from threading import Thread
import tempfile
from video import Video
from tracking import landmarks
from analysis import feedback
import uuid

ALL_INSTANCES = {}


class Instances:
    def __init__(self):
        self.instances = {}

    def get_instance(self, id):
        return self.instances.get(id)
    
    def add_instance(self, id, instance):
        self.instances[id] = instance

class Instance:
    def __init__(self, bytes, instances: Instances):
        self.bytes = bytes
        self.status = 'Not Started'
        self.done = False
        self.progress = 0
        self.result = None
        self.id = str(uuid.uuid4())
        instances.add_instance(self.id, self)
    
    def start(self):
        self.thread = Thread(target=self.run)
        self.thread.start()
    
    def get_id(self):
        return self.id

    def get_status(self):
        return {
            'status': self.status,
            'progress': self.progress,
            'done': self.done
        }

    def get_result(self):
        return self.result

    def run(self):
        self.status = 'Setting Up'
        self.file = tempfile.NamedTemporaryFile(suffix='.mov') # create temp file for video
        self.file.write(self.bytes)
        self.file.flush()
        self.video = Video(self.file.name)

        self.status = 'Analyzing Video'
        data = landmarks(self.video)

        self.status = 'Generating Feedback'
        feedback_data = feedback(data)

        self.status = 'Finishing'
        self.result = {
            'feedback': feedback_data
        }
        self.file.close()

        self.status = 'Finished'
        self.done = True