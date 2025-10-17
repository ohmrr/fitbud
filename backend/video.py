# Load video

import cv2
import tempfile

class Video:
    def __init__(self, path: str):
        '''load the video'''
        self.path = path

    def frames(self):
        '''generator that yields the frames of the video'''
        cap = cv2.VideoCapture(self.path)
        while True:
            success, frame = cap.read()
            if not success: break
            yield cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        cap.release()