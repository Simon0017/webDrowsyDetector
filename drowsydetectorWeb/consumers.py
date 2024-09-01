# consumers.py
import datetime
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from PIL import Image
import io
import base64
import numpy as np
import cv2

# models
face_detector=cv2.CascadeClassifier('C:/Users/wekes/OneDrive/Documents/PROJECTS/WebDrowsyDetector/Web/drowsydetector/drowsydetector/haarcascade_frontalface_default.xml')

class ImageClassifierConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data =None,bytes_data = None):
        if bytes_data:
            # Process the received Blob (binary data)
            np_arr = np.frombuffer(bytes_data, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            face_count = 0
            if frame is not None:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = face_detector.detectMultiScale(gray,scaleFactor=1.1, minNeighbors=10, minSize=(30, 30))
                if len(faces) > 0:
                    face_count = len(faces)
                    print(f'system has detected {len(faces)} no of faces')
                else:
                    print('No faces detected')
                # Send the classification result back to the frontend
                # await self.send(text_data=json.dumps({
                #     'classification': f'a frame has been detected',
                # }))

            else:
                print('No frame detected')
