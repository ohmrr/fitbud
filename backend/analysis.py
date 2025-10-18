# Analyze pose data to give feedback

from dotenv import load_dotenv
import numpy as np
from mediapipe.python.solutions.pose import PoseLandmark
import os
from openai import OpenAI

load_dotenv()
client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv('OPENROUTER_KEY'),
)

def ask_model(message):
    completion = client.chat.completions.create(
        extra_headers={},
        extra_body={},
        model="tngtech/deepseek-r1t2-chimera:free",
        messages=[
            {
            "role": "user",
            "content": message
            }
        ]
    )
    print(completion.choices[0].message.content)

def feedback(data):
    '''takes tracking data and generates feedback'''
    angle_data = track_angle(data)
    trimmed = [round(angle) for i, angle in enumerate(angle_data) if i % 10 == 0]
    data_string = ' '.join(str(trimmed))
    prompt = 'below are values for the angle of the knee over time as someone performs a squat. provide one line feedback on if the form appears healthy. measurements may not be exact, do not be too strict. a squat should start straight up, slowly go down to roughly 75-90 degrees, then slowly go back up. '
    result = ask_model(prompt + data_string)
    return result

def track_angle(data):
    result = []
    for frame in data:
        lh = frame[PoseLandmark.LEFT_HIP]
        lk = frame[PoseLandmark.LEFT_KNEE]
        la = frame[PoseLandmark.LEFT_ANKLE]
        lh = (lh.x, lh.y, lh.z)
        lk = (lk.x, lk.y, lk.z)
        la = (la.x, la.y, la.z)
        result.append(float(calculate_angle(lh, lk, la)))
    
    return result


def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    angle = np.degrees(np.arccos(cosine_angle))
    return angle