# Analyze pose data to give feedback

from dotenv import load_dotenv
import numpy as np
from mediapipe.python.solutions.pose import PoseLandmark
import os
from openai import OpenAI

with open('prompt.txt') as file:
    PROMPT = file.read()

load_dotenv()
client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv('OPENROUTER_KEY'),
)

def ask_model(message):
    completion = client.chat.completions.create(
        extra_headers={},
        extra_body={},
        model="meta-llama/llama-4-maverick:free",
        messages=[
            {
            "role": "user",
            "content": message
            }
        ]
    )
    return completion.choices[0].message.content

def feedback(data):
    '''takes tracking data and generates feedback'''
    angle_data = track_angle(data)
    trimmed = [round(angle) for i, angle in enumerate(angle_data) if i % 5 == 0]
    data_string = ' '.join(str(x) for x in trimmed)
    # print(data_string)
    # prompt = 'below are values for the angle of the knee over time as someone performs a squat. provide one line feedback on if the form appears healthy. measurements may not be exact, do not be too strict. a squat should start straight up, slowly go down to roughly 75-90 degrees, then slowly go back up. '
    result = ask_model(PROMPT + data_string)
    return result

def track_angle(data):
    result = []
    l_vis = r_vis = 0
    for frame in data:
        if frame is None: continue
        lh = frame[PoseLandmark.LEFT_HIP]
        lk = frame[PoseLandmark.LEFT_KNEE]
        la = frame[PoseLandmark.LEFT_ANKLE]
        rh = frame[PoseLandmark.RIGHT_HIP]
        rk = frame[PoseLandmark.RIGHT_KNEE]
        ra = frame[PoseLandmark.RIGHT_ANKLE]
        l_vis += lh.visibility + lk.visibility + la.visibility
        r_vis += rh.visibility + rk.visibility + ra.visibility
    
    if l_vis > r_vis:
        HIP = PoseLandmark.LEFT_HIP
        KNEE = PoseLandmark.LEFT_KNEE
        ANKLE = PoseLandmark.LEFT_ANKLE
    else:
        HIP = PoseLandmark.RIGHT_HIP
        KNEE = PoseLandmark.RIGHT_KNEE
        ANKLE = PoseLandmark.RIGHT_ANKLE


    for frame in data:
        if frame is None: continue
        h = frame[HIP]
        k = frame[KNEE]
        a = frame[ANKLE]

        h = (h.x, h.y, h.z)
        k = (k.x, k.y, k.z)
        a = (a.x, a.y, a.z)
        result.append(float(calculate_angle(h, k, a)))
    
    return result


def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    angle = np.degrees(np.arccos(cosine_angle))
    return angle