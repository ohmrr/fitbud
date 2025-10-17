# runs the entire process from reading video to generating feedback

from threading import Thread
import tempfile
from video import Video
from tracking import landmarks
from analysis import feedback
import uuid

ALL_INSTANCES = {}

class Instance:
    def __init__(self, bytes):
        self.bytes = bytes
        self.status = 'Not Started'
        self.progress = 0
        self.result = None
        self.id = uuid.uuid4()
        ALL_INSTANCES[self.id] = self
    
    def start(self):
        self.thread = Thread(target=self.run)
        self.thread.start()
    
    def get_id(self):
        return self.id

    def get_status(self):
        return {
            'status': self.status,
            'progress': self.progress
        }

    def get_result(self):
        return self.result

    def run(self):
        self.status = 'Setting Up'
        self.file = tempfile.NamedTemporaryFile(suffix='.mp4') # create temp file for video
        self.file.write(self.bytes)
        self.file.flush()
        self.video = Video(self.file.name)

        self.status = 'Analyzing Video'
        data = landmarks(self.video)

        self.status = 'Generating Feedback'
        feedback = feedback(self.video)

        self.status = 'Finishing'
        self.result = {
            'feedback': feedback
        }
        self.file.close()

        self.status = 'Finished'

def get_instance(id) -> Instance:
    return ALL_INSTANCES[id]