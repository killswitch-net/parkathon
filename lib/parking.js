import fetch from 'node-fetch';

const OpenStreetMapQuery = (url, query) => {
	return new Promise((resolve, reject) => {
		fetch(url, {
			method: 'POST',
			body: query
		}).then((response) => {
			if (!response.ok) {
				reject(`fetch failed`);
			}
			return response.json();
		}).then((data) => {
			resolve(data.elements);
		}).catch((error) => {
			return reject(`fetch request failed, err: ${error}`);
		});
	});
};

const OverpassQuery = (query) => {
	return OpenStreetMapQuery("https://overpass-api.de/api/interpreter", `data=${query}`);
};

const NominatimQuery = async (query) => {
	const url = `https://nominatim.openstreetmap.org/search.php?${
		new URLSearchParams({
			q: query,
			format: 'json',
		})
	}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
    }
	return await response.json();
};

/**
 * Sends a POST request to the OpenStreetMap API to fetch information about roads 
 * within a 1km radius around a specified node.
 *
 * @param ${node} The wiki identifier for the region we want to extract data for, 
 *                Example would be '146304012' which points to Trilofos, Thessaloniki.
 *                Example would be '57554537' which points to Thessaloniki.
 * @param ${radius} A number representing the radius around the area we want to query (in meters).
 * @return {Array} An array of elements, each describing a road within a 1km radius of the specified node. 
 *         Each element contains the following attributes:
 *           - `type`: Set to 'way', representing the road.
 *           - `tags`: A set of user-readable tags for the road, including the road's `name` (if available).
 *           - `geometry`: An array of coordinates representing the road's path, typically at each intersection.
 *
 * @example Iterating through every road that is returned from this function.
 * @code
 *	for (let element in result) {
 *		if (element.type === 'way' && element.nodes && element.nodes.length > 1) {
 *			console.log(`Road ${element.tags?.name || 'Unnamed Road'}`);
 *			for (let intersection in element.geometry) {
 *				console.log(`intersection (${intersection.lat}, ${intersection.lon})`);
 *			}
 *		}
 *	}
 * @endcode
 *
 * @example Iterating through every road but without caring about the intersections.
 * @code
 *	for (let element in result) {
 *		if (element.type === 'way' && element.geometry && element.geometry.length > 1) {
 *			let start = element.geometry[0];
 *			let end = element.geometry[element.geometry.length - 1];
 *		
 *			console.log(`Road ${element.tags?.name || 'Unnamed Road'}`);
 *			console.log(`from (${start.lat}, ${start.lon}) to (${end.lat}, ${end.lon})`);
 *		}
 *	}
 * @endcode
 */
const OpenStreetMapFetchRoads = (node, radius) => {
	const query = `[out:json];node(id:${node});way[highway](around:${radius});(._; >;);out body geom tags;`;
	return OverpassQuery(query);
};

const OpenStreetMapFetchRoadsAt = (lat, lon, radius) => {
	const query = `[out:json];way[highway](around:${radius},${lat},${lon});(._; >;);out body geom tags;`;
	return OverpassQuery(query);
};

const OpenStreetNodeInfo = (node) => {
	const query = `[out:json];node(id:${node});way[highway](around:10);out tags;`;
	return OverpassQuery(query);
};

const deg2rad = (deg) => (deg * Math.PI) / 180;

const HaversineDistance = (A, B) => {
	const lat1 = deg2rad(A.lat);
    const lon1 = deg2rad(A.lon);
    const lat2 = deg2rad(B.lat);
    const lon2 = deg2rad(B.lon);
	
    const dlat = lat2 - lat1;
	const dlon = lon2 - lon1;
    const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const OpenStreetLocationInfoAt = async (lat, lon) => {
	const query = `[out:json];(node(around:10, ${lat}, ${lon}););out body center tags;`;

	try {
		const data = await OverpassQuery(query);

		let nearest = null;
		let best = Infinity;

		for (const element of data) {
			const elat = element.lat || (element.center && element.center.lat);
			const elon = element.lon || (element.center && element.center.lon);
			if (elat && elon) {
				const distance = HaversineDistance({lat, lon}, {lat: elat, lon: elon});
				
				if (distance < best) {
					best = distance;
					nearest = element;
				}
			}
		}
		
		return OpenStreetNodeInfo(nearest.id);
	} catch (error) {
		throw error;
	}
};

const OpenStreetMapFetchNodesNamed = (name) => {
	return NominatimQuery(name);
};

/**
 * Implementation of the Mercator Projection, converting the latitude and longitude 
 * coordinates to Euclidean space (in meters).
 * 
 * Output from this function can be directly used for a kDTree.
 * Beware that the Earth is spherical and can wrap around!
 */
const GeographicToEuclidean = (geo) => {
	const latRad = deg2rad(geo.lat);
    const lonRad = deg2rad(geo.lon);
	
	const x = lonRad * 6371000;
    const y = Math.log(Math.tan(Math.PI / 4 + latRad / 2)) * 6371000;
	
	return [x, y];
}

/**
 * Implementation of the Mercator Projection, converting the latitude and longitude 
 * coordinates to Euclidean space (in meters), this function will return 3 points, 
 * wraping around the earth.
 * 
 * Output from this function can be directly used for a kDTree.
 * Beware that the Earth is spherical and can wrap around!
 * @code
 *	for (let element of result) {
 *		if (element.type === 'way' && element.nodes.length > 1) {
 *			for (let intersection of element.geometry) {
 *				kdtree.InsertPoints(GeographicToEuclideanSafe(intersection));
 *			}
 *		}
 *	}
 * @endcode
 */
const GeographicToEuclideanSafe = (geo) => {
	return [
		GeographicToEuclidean({
			lan : geo.lan,
			lon : geo.lon - 360,
		}),
		GeographicToEuclidean({
			lan : geo.lan,
			lon : geo.lon,
		}),
		GeographicToEuclidean({
			lan : geo.lan,
			lon : geo.lon + 360,
		})
	];
};

const ParkingRoadFactor = (type) => {
	switch (type) {
		case 'parallel': return 1;
		case 'perpendicular': return 2;
		case 'diagonal': return 1.5;
	}
	return 0;
};

const ParkingRoadInterpolate = (A, B, fraction) => {
	const lat1 = A.lat * Math.PI / 180;
    const lon1 = A.lon * Math.PI / 180;
    const lat2 = B.lat * Math.PI / 180;
    const lon2 = B.lon * Math.PI / 180;

    const d = HaversineDistance(A.lat, A.lon, B.lat, B.lon) / 6371000;
    const a = Math.sin((1 - fraction) * d) / Math.sin(d);
    const b = Math.sin(fraction * d) / Math.sin(d);

    const x = a * Math.cos(lat1) * Math.cos(lon1) + b * Math.cos(lat2) * Math.cos(lon2);
    const y = a * Math.cos(lat1) * Math.sin(lon1) + b * Math.cos(lat2) * Math.sin(lon2);
    const z = a * Math.sin(lat1) + b * Math.sin(lat2);

    const latInterpolated = Math.atan2(z, Math.sqrt(x ** 2 + y ** 2)) * 180 / Math.PI;
    const lonInterpolated = Math.atan2(y, x) * 180 / Math.PI;

    return { lat: latInterpolated, lon: lonInterpolated };
}

/**
 * After retrieving all the latest data from #OpenStreetMapFetchRoads this function 
 * returns the parking spaces for each road, taking into consideration law limiations. 
 * NOTE: It would be nice to visualize these results but not for the user to view!
 * 
 * @param {Array} Information regarding roads, fetched from open street map.
 *
 * @return {Array} An array of 2 dimensional Euclidean points in space, 
 * each point representing a parking space.
 */
const GeographicDataToParkingSpaces = (data) => {
	let intersections = {};
	
	for (let element of data) {
		if (element.type === 'way' && element.geometry && element.geometry.length > 1) {
			element.geometry.forEach(geometry => {
				intersections[geometry] = (intersections[geometry] || 0) + 1;
			});
		}
	}
	
	let result = [];
	
	for (let element of data) {
		if (element.type === 'way' && element.geometry && element.geometry.length > 1) {
			let mult = 2;
			
			if (['motorway', 'trunk', 'primary'].includes(element.tags?.highway)) {
				console.log(element.tags.name || 'Unnamed road', 'was skipped because no parking is allowed there!');
				continue;
			}
			
			const tags = element.tags || {};
			const keys = Object.keys(element.tags).filter(tag => tag.startsWith('parking'));
			if (keys.length > 0) {
				mult = 0;
				
				if (tags['parking:lane:left']) {
					mult += ParkingRoadFactor(tags['parking:lane:left']);
				}
				if (tags['parking:lane:right']) {
					mult += ParkingRoadFactor(tags['parking:lane:right']);
				}
				if (tags['parking:lane:both']) {
					mult += ParkingRoadFactor(tags['parking:lane:both']) * 2;
				}
			}
			
			if (tags['oneway'] === 'yes') {
				mult = Math.min(mult, 1);
			}
			
			if ((tags['lanes'] || 2) >= 4) {
				mult = Math.max(mult - 1, 0);
			}
			
			if (mult <= 0) {
				continue;
			}
			
			if (!element.tags.name) {
				continue;
			}
			
			for (let j = 1; j <= element.geometry.length - 1; j++) {
				const A = element.geometry[j - 1];
				const B = element.geometry[j - 0];
				const a = GeographicToEuclidean(A);
				const b = GeographicToEuclidean(B);
				const length = HaversineDistance(A, B);
				const join = (intersections[A] > 1 ? 10 : 0) + (intersections[B] > 1 ? 10 : 0);
				/**
				 * Average size of a car is 4.9m, we add 0.2m for padding, 
				 * we are also not allowed to park closer than 10m to each intersection!
				 */
				const totalp = Math.max((length - join) * mult / (4.9 + 0.2), 0);
				
				for (let j = 1; j <= totalp; j++) {
					/**
					 * We make it so that we never add parking spaces to the edge of the road.
					 */
					const t = j / (totalp + 1);
					
					result.push([
						/** x: */ a[0] * t + b[0] * (1 - t),
						/** y: */ a[1] * t + b[1] * (1 - t),
						/**
						 * These are kept after (x, y) in order to be used with kDTree,
						 * without affecting the metric, since only the first two dimensions are 
						 * taken into account when computing distance!
						 */
						/** lat: */ A.lat * t + B.lat * (1 - t),
						/** lon: */ A.lon * t + B.lon * (1 - t),
					]);
				}
			}
		}
	}
	
	return result;
};

export default {
	OpenStreetMapFetchRoads,
	OpenStreetMapFetchRoadsAt,
	OpenStreetNodeInfo,
	OpenStreetLocationInfoAt,
	OpenStreetMapFetchNodesNamed,
	GeographicToEuclidean,
	GeographicToEuclideanSafe,
	GeographicDataToParkingSpaces,
};
