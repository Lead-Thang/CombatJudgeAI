import cv2
import numpy as np
import os
import time
import random  # Added to fix undefined variable error
from flask import Flask, request, jsonify, Response  # Updated to include Response


def analyze_video(video_path):
    """Analyze a real video file using computer vision and AI models."""
    # Load YOLO model
    labels = open('./cfg/coco.names').read().strip().split("\n")
    colors = np.random.randint(0, 255, size=(len(labels), 3), dtype='uint8')

    net = cv2.dnn.readNetFromDarknet('./cfg/yolov3_coco.cfg', './cfg/yolov3_coco.weights')
    ln = net.getLayerNames()
    ln = [ln[i[0] - 1] for i in net.getUnconnectedOutLayers()]

    # cv2 members are not discoverable by static analysis tools; this is a known issue.
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise ValueError("Could not open video file.")

    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Initialize stats
    fighter_a_strikes = 0
    fighter_b_strikes = 0
    control_time_a = 0 # Placeholder for control time
    control_time_b = 0 # Placeholder for control time
    fighter_boxes = {"person": []}

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Process every 5th frame to reduce computational load
        if int(cap.get(cv2.CAP_PROP_POS_FRAMES)) % 5 == 0:
            # Create blob from frame and run YOLO
            blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), swapRB=True, crop=False)
            net.setInput(blob)
            layer_outputs = net.forward(ln)

            # Process detections
            boxes = []
            confidences = []
            class_ids = []

            for output in layer_outputs:
                for detection in output:
                    scores = detection[5:]
                    class_id = np.argmax(scores)
                    confidence = scores[class_id]

                    if confidence > 0.5 and labels[class_id] == "person":
                        # Extract box coordinates
                        box = detection[0:4] * np.array([width, height, width, height])
                        center_x, center_y, w, h = box.astype("int")
                        x = int(center_x - (w / 2))
                        y = int(center_y - (h / 2))

                        boxes.append([x, y, int(w), int(h)])
                        confidences.append(float(confidence))
                        class_ids.append(class_id)

            # Apply non-maxima suppression
            idxs = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.3)

            if len(idxs) > 0:
                detected_boxes = []
                for i in idxs.flatten():
                    (x, y) = (boxes[i][0], boxes[i][1])
                    (w, h) = (boxes[i][2], boxes[i][3])
                    detected_boxes.append([x, y, x+w, y+h])  # Store as [x1,y1,x2,y2]

                    # Draw boxes on the frame for visualization
                    color = [int(c) for c in colors[class_ids[i]]]
                    cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

                fighter_boxes["person"].append({
                    "frame": int(cap.get(cv2.CAP_PROP_POS_FRAMES)),
                    "boxes": detected_boxes
                })

        # TODO: Add more AI analysis here:
        # - Track fighters across frames
        # - Estimate poses
        # - Recognize actions (strikes, takedowns)
        # - Calculate control time based on position and movement
        # Placeholder logic:
        fighter_a_strikes += random.randint(0, 1)
        fighter_b_strikes += random.randint(0, 1)

    cap.release()

    # Determine winner based on simulated stats
    winner = "Jon Jones" if fighter_a_strikes > fighter_b_strikes else "Francis Ngannou"

    return {
        'videoMetadata': {
            'title': video_path.split('/')[-1],
            'duration': frame_count / fps,
            'resolution': f"{width}x{height}",
            'fps': fps
        },
        'fighterA': {
            'name': "Jon Jones",
            'strikes': fighter_a_strikes,
            'controlTime': control_time_a,
        },
        'fighterB': {
            'name': "Francis Ngannou",
            'strikes': fighter_b_strikes,
            'controlTime': control_time_b,
        },
        'winner': winner,
        'summary': f"{winner} won the fight with superior striking accuracy.",
        'rounds': [],  # You can fill this in later with per-round data
        'detections': fighter_boxes
    }

if __name__ == "__main__":
    app = Flask(__name__)

    # Add CORS middleware to allow requests from React frontend
    @app.after_request
    def after_request(response: Response):
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        return response

    @app.route('/analyze', methods=['POST'])
    def analyze():
        video_path = request.json.get('video_path')
        if not video_path:
            return jsonify({"error": "No video path provided"}), 400
        
        try:
            result = analyze_video(video_path)
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    app.run(debug=True, host='0.0.0.0', port=5000)
