from video import Video
from tracking import landmarks
from analysis import feedback

video = Video('sample/squat.mov')
data = landmarks(video)
print(feedback(data))