import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from model import train_model, parkingChance

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['GET'])
def predict():
    try:
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        timestamp = request.args.get('timestamp')
        weather = request.args.get('weather')
        radius = request.args.get('radius', 50)

        if not lat or not lon or not timestamp or not weather:
            return jsonify({'error': 'Missing required parameters'}), 400

        print(f"Making request to backend with lat: {lat}, lon: {lon}, radius: {radius}")
        response = requests.get('https://localhost/api/park/find', params={
            'lat': lat,
            'lon': lon,
            'rad': radius
        })

        if response.status_code != 200:
            print(f"Backend response status code: {response.status_code}")
            print(f"Backend response text: {response.text}")
            return jsonify({'error': 'Failed to fetch parking spots'}), 500

        nearest_spots = response.json()

        results = []
        for spot in nearest_spots:
            spot_lat = spot[2]
            spot_lon = spot[3]
            model = train_model(spot_lon, spot_lat)
            probability = parkingChance(model, timestamp, weather)
            results.append({'coords': f"{spot_lat},{spot_lon}", 'probability': probability})

        return jsonify(results)
    except requests.exceptions.RequestException as e:
        print(f"RequestException: {e}")
        return jsonify({'error': 'Failed to connect to backend service', 'details': str(e)}), 500
    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9001)