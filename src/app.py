import os
import requests
from flask import Flask, request, jsonify
from model import train_model, parkingChance

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():

    data = request.get_json()
    destination = data['coords']
    timestamp   = data['timestamp']
    weather     = data['weather']
    radius      = data.get('radius', 50)  # default to 50 meters

    # POST request to the /park/find endpoint
    lat, lon = map(float, destination.split(','))
    response = requests.post(f'http://{os.getenv('MY_HOST')}:9000/park/find', json={
        'lat': lat,
        'lon': lon,
        'rad': radius
    })

    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch parking spots'}), 500

    nearest_spots = response.json()

    results = []
    for spot in nearest_spots:

        spot_lat = spot[2]
        spot_lon = spot[3]
        model = train_model(spot_lon, spot_lat)  # train a model for each spot
        probability = parkingChance(model, timestamp, weather)
        results.append({'coords': f"{spot_lat},{spot_lon}", 'probability': probability})

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9001)
