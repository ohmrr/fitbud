# STEP 1: Import the necessary modules.
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
VisionRunningMode = mp.tasks.vision.RunningMode
import cv2 # Import cv2
from analysis import feedback

# STEP 2: Create an PoseLandmarker object.
base_options = python.BaseOptions(model_asset_path='pose_landmarker.task')
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    output_segmentation_masks=True,
    running_mode=VisionRunningMode.IMAGE)
detector = vision.PoseLandmarker.create_from_options(options)

# STEP 3: Load the input image.
image = mp.Image.create_from_file('sample/image.png')

# STEP 4: Detect pose landmarks from the input image.
detection_result = detector.detect(image)

print(feedback([detection_result.pose_world_landmarks[0]]))

# print(feedback([detection_result.pose_world_landmarks]))
 