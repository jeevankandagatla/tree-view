from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

DATA_FILE = "tree_data.json"

# Initial data as fallback (Matches Root -> A, B example)
INITIAL_DATA = {
    "nodes": [
        {"id": "root", "type": "treeNode", "data": {"name": "Root", "role": ""}, "position": {"x": 0, "y": 0}},
        {"id": "a", "type": "treeNode", "data": {"name": "A", "role": ""}, "position": {"x": 0, "y": 0}},
        {"id": "a1", "type": "treeNode", "data": {"name": "A1", "role": ""}, "position": {"x": 0, "y": 0}},
        {"id": "a2", "type": "treeNode", "data": {"name": "A2", "role": ""}, "position": {"x": 0, "y": 0}},
        {"id": "b", "type": "treeNode", "data": {"name": "B", "role": ""}, "position": {"x": 0, "y": 0}},
        {"id": "b1", "type": "treeNode", "data": {"name": "B1", "role": ""}, "position": {"x": 0, "y": 0}},
        {"id": "b2", "type": "treeNode", "data": {"name": "B2", "role": ""}, "position": {"x": 0, "y": 0}}
    ],
    "edges": [
        {"id": "e-root-a", "source": "root", "target": "a", "animated": True, "markerEnd": {"type": "arrowclosed", "color": "#6366f1"}, "style": {"stroke": "#6366f1", "strokeWidth": 2}},
        {"id": "e-a-a1", "source": "a", "target": "a1", "animated": True, "markerEnd": {"type": "arrowclosed", "color": "#6366f1"}, "style": {"stroke": "#6366f1", "strokeWidth": 2}},
        {"id": "e-a-a2", "source": "a", "target": "a2", "animated": True, "markerEnd": {"type": "arrowclosed", "color": "#6366f1"}, "style": {"stroke": "#6366f1", "strokeWidth": 2}},
        {"id": "e-root-b", "source": "root", "target": "b", "animated": True, "markerEnd": {"type": "arrowclosed", "color": "#6366f1"}, "style": {"stroke": "#6366f1", "strokeWidth": 2}},
        {"id": "e-b-b1", "source": "b", "target": "b1", "animated": True, "markerEnd": {"type": "arrowclosed", "color": "#6366f1"}, "style": {"stroke": "#6366f1", "strokeWidth": 2}},
        {"id": "e-b-b2", "source": "b", "target": "b2", "animated": True, "markerEnd": {"type": "arrowclosed", "color": "#6366f1"}, "style": {"stroke": "#6366f1", "strokeWidth": 2}}
    ]
}

def load_data():
    if not os.path.exists(DATA_FILE):
        return INITIAL_DATA
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except:
        return INITIAL_DATA

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

@app.route("/api/tree", methods=["GET"])
def get_tree():
    return jsonify(load_data())

@app.route("/api/tree", methods=["POST"])
def post_tree():
    data = request.json
    save_data(data)
    return jsonify({"status": "success"})

@app.route("/api/tree/reset", methods=["POST"])
def reset_tree():
    save_data(INITIAL_DATA)
    return jsonify(INITIAL_DATA)

if __name__ == "__main__":
    print("Tree-View Backend running on http://localhost:5000")
    app.run(debug=True, port=5000)
