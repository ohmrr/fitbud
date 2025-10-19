from video import Video
from tracking import landmarks
from analysis import feedback, track_angle

video = Video('sample/iphone.mov')
data = landmarks(video)
# print(data)
print(track_angle(data))
print(feedback(data))