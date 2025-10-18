# Analyze pose data to give feedback

import numpy as np
from mediapipe.python.solutions.pose import PoseLandmark

def feedback(data):
    '''takes tracking data and generates feedback'''
    result = ''
    for frame in data:
        lh = frame[PoseLandmark.LEFT_HIP]
        lk = frame[PoseLandmark.LEFT_KNEE]
        la = frame[PoseLandmark.LEFT_ANKLE]
        lh = (lh.x, lh.y, lh.z)
        lk = (lk.x, lk.y, lk.z)
        la = (la.x, la.y, la.z)
        result += f'{float(calculate_angle(lh, lk, la))}\n'
    return result


def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    angle = np.degrees(np.arccos(cosine_angle))
    return angle