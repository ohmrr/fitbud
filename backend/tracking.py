# Track motion in video frames

from video import Video
import mediapipe as mp

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

def landmarks(video: Video):
    '''return list of landmark locations for each frame of the video'''
    result = []
    with mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        enable_segmentation=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as pose:
        for frame in video.frames():
            results = pose.process(frame)
            result.append(results.pose_landmarks)
    return result