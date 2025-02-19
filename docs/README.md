## Backend

As far as the backend is concerned the following queries are available on port 9000.

### GET /park/list/active

**Purpose**: This endpoint is used to return a list of all the current parking spots occupied by the specified user.

**Query Parameters**:

- `user`: (number) The unique ID of the user occupying the parking spot.

### GET /park/list/all

**Purpose**: This endpoint is used to return a list of all the parking spots listed by the specified user.

**Query Parameters**:

- `user`: (number) The unique ID of the user occupying the parking spot.

### POST /park/occupy

**Purpose**: This endpoint is used to mark a specific location as occupied by a user.

**Query Parameters**:

- `user`: (number) The unique ID of the user occupying the parking spot.
- `lat`: (number) The latiture of the location.
- `lon`: (number) The longtitute of the location.

### POST /park/vacay

**Purpose**: This endpoint is used to mark a specific parking as vacated by a user.

**Query Parameters**:

- `user`: (number) The unique ID of the user occupying the parking spot.
- `parking`: (number) The unique ID of the parking location that should be marked as vacated.

### GET /park/find

**Purpose**: This endpoint is used to return all the currently empty parking location near a location

**Query Parameters**:

- `lat`: (number) The latiture of the location.
- `lon`: (number) The longtitute of the location.
- `rad`: (number) The radius in meters we want to search.

### GET /predict (PORT 9001)

**Purpose**: This endpoint is used to predict the availability of parking spots based on the user's coordinates, timestamp, weather, and search radius.

**Query Parameters**:

- `coords`: (string) The coordinates (latitude and longtitude).
- `timestamp`: (string) The timestamp of the request in the format "dd-mm-yyyy hh:mm".
- `weather`: (string) The weather conditions at the time of the request in the format "Condition Temperature".
- `radius`: (number) The radius in meters to search for available parking spots (default is 50 meters).

# Internal Library Utils (Parkathon)

The home directory for datastructures/algorithms and common API calls used by parkathon.

## KDTree

A fast tree structure for point clouds, supporting point insertion, deletion, and radius-based queries. The tree stores points as arrays of numbers using the Euclidean distance metric.

### Construction

To create a KDTree, specify the dimensionality of the points:

```js
import kDTree from 'kdtree.js';
let tree = new kDTree(/* 2 */);
```

### Insert/Remove

* **InsertPoint:** Inserts a new point to the tree, does not take duplicates into account!
* **EnsurePoint:** Inserts a new point to the tree (if there is no other point with the same coordinates)!
* **RemovePoint:** Removes a point from the tree if the point was in the tree!

```js
tree.InsertPoint([2, 3]);
tree.RemovePoint([2, 3]);
```

### Insert/Remove Multiple

* **InsertPoints/EnsurePoints:** Insert multiple points (stored in an array) in the tree!

```js
tree.InsertPoints([[2, 3], [5, 3], [2, 5], [8, 1]]);
tree.EnsurePoints([[7, 3], [5, 3], [0, 5], [8, 1]]);
```

### Querying

To query points within a given radius, use the `Query` method with a target location and a radius. The order of the results is not guaranteed.

```js
let target = [5, 5];
let radius = 5;

tree.Query(target, radius).forEach((pt) => {
	console.log("Point", pt, "is within", radius, "meters of", target);
})
```

## Parking

### Geographical Information

Simple queries regarding the roads and geometrical elements of a region can be retrieved using the following functions:

* **OpenStreetMapFetchRoads:** Fetches roads and geometrical data within a specified radius around a region.
	- params
		- `node` | The ID of the region or node for which to request information.
		- `radius` | The search radius in meters.
	- return
		- An array of elements with the following attributes:
			- `.geometry` | An array of {lat, lon} objects representing the latitude and longitude of each road vertex.
			- `.tags` | A set of user-readable tags, such as the road's name, lane information, and parking restrictions.
			- `.nodes` | A list of adjacent nodes for each road element.

```js
import parking from './lib/parking.js';

parking.OpenStreetMapFetchRoads(57554537 /* Thessaloniki */ , 1000).then((roads) => {
	console.log(roads);
});
```

* **OpenStreetNodeInfo:** A simpler version of OpenStreetMapFetchRoads that only returns the tags.
	- params
		- `node` | The ID of the region or node for which to request information.
	- return 
		- An array of elements with the following attributes:
			- `.tags` | A set of user-readable tags, such as the road's name, lane information, and parking restrictions.

```js
import parking from './lib/parking.js';

parking.OpenStreetNodeInfo(57554537 /* Thessaloniki */).then((info) => {
	console.log(info); /* `info[0].tags.name` Should contain the name of the node if applicable! */
});
```

* **OpenStreetMapFetchNodesNamed:** Returns a list of places with the specified name.
	- params
		- `name` | The name of the place we want to search
	- return
		- An array of places that match the name search query, with the following attributes:
			- `.name` | User readable name (e.g. 'Περαία').
			- `.display_name` | Full user readable name, in context (e.g. 'Περαία, Thermaikos Municipality, Thessaloniki Regional Unit, Central Macedonia, Macedonia and Thrace, 570 19, Greece').
			- `.osm_id` | (When applicable) The OpenStreeMap node id (can be used with the rest of the OpenStreetMap functions).
			- `.addresstype` | The type of the place (village/city/etc.).

```js
parking.OpenStreetMapFetchNodesNamed('Trilofos').then((data) => {
	data.forEach((place) => {
		console.log(place.display_name);
	});
});
```

Parking spot calculation in a region can be done using the `GeographicDataToParkingSpaces`.
It expects data from the `OpenStreetMapFetchRoads` method and return an array of available parking spots.

Each parking spot is represented by four numbers.

 * [0] Also known as the 'x' coordinate in a 2D plane when projecting the map of the parking spot.
 * [1] Also known as the 'y' coordinate in a 2D plane when projecting the map of the parking spot.
 * [2] The 'lat' representing the latitude of the parking spot.
 * [3] The 'lon' representing the longitude of the parking spot.

```js
parking.OpenStreetMapFetchRoads(57554537 /* Thessaloniki */, 1000).then((road) => {
	parking.OpenStreetNodeInfo(57554537 /* Thessaloniki */).then((info) => {
		const spots = parking.GeographicDataToParkingSpaces(road);
		console.log(spots.length, "spots in", info[0].tags.name);
	});
});
```
## Predict

Finds the all the available parking spots in given radius with the above coordinates, timestamp and weather. Returns a list of spots ([lon,lat] pairs) with their respective probabilities of being free. 

### Database Interaction

* **DB_connect:** Establishes a connection to the MySQL database using environment variables for configuration.
```python
from db import DB_connect
conn = DB_connect()
```

* **fetch:** Fetches all parking instances at a given spot (latitude and longitude).
```python
from db import fetch
info = fetch(lat, lon)
```

* **fetch_all:** Fetches all distinct parking spots (latitude and longitude pairs are unique for each spot). *(OBSOLETE)*
```python
from db import fetch_all
unique = fetch_all()
```

### Preprocessing

* **preprocess:** Splits the DataFrame into two DataFrames: one for the start (label 0) and one for the end of the trips (label 1).
```python
from preprocessing import preprocess
df1, df2 = preprocess(df)
```

* **add_features:** Creates new features out of a timestamp.
```python
from preprocessing import add_features
df = add_features(df)
```

### Model Training and Prediction

* **train_model:** Trains a Random Forest classifier on the parking data for a given spot.
```python
from model import train_model
model = train_model(spot_lon, spot_lat)
```

* **parkingChance:** Predicts the probability that a given parking spot is free based on the trained model, timestamp, and weather conditions.
```python
from model import parkingChance
probability = parkingChance(model, timestamp, weather)
```

* **parkingPrediction:** Handles POST requests to predict parking spot availability based on user input.

Example Usage:
```js
parkingPrediction('40.7128', '-74.0060', '2023-10-15T14:00:00', 'Sunny 23C', 50);
```