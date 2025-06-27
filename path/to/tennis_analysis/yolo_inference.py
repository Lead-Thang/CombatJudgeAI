"""
This module provides functionality for performing object detection using YOLO.
It includes functions for loading a YOLO model, making predictions on images,
and potentially processing video frames for real-time analysis.

Functions:
    - load_model: Loads a YOLO model.
    - predict: Makes predictions on an input image using the loaded YOLO model.
"""
from ultralytics import YOLO

model = YOLO('yolov8x')
model.predict('input_videos/image.png',save = True)
