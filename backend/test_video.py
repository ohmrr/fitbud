from video import Video
from tracking import landmarks
from analysis import feedback

video = Video('sample/video.mp4')
data = landmarks(video)
print(feedback(data))