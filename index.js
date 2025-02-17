import kDTree from './lib/kdtree.js';
import parking from './lib/parking.js';

import express from "express";
import fetch from "node-fetch";
import mysql from 'mysql2/promise';

const prt = 9000;
const app = express();

const config = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
};

app.get('/user/login', async (req, res) => {
	
});

app.get('/user/signup', async (req, res) => {
	
});

app.get('/park/occupy', async (req, res) => {
	
});

app.get('/park/vacay', async (req, res) => {
	
});

app.get('/park/find', async (req, res) => {
	let {
		lat,
		lon,
		rad,
	} = req.query;
	
	if (!lat || !lon) {
		return res.status(400).json({ error: "Latitude and longitude are required" });
	}
	
	rad = rad || 100; // By default the radius is 100m
	
	try {
		const tree = new kDTree();
		const conn = await mysql.createConnection(config);
		const data = await parking.OpenStreetMapFetchRoadsAt(lat, lon, rad);
		const spot = parking.GeographicDataToParkingSpaces(data);
		const [rows] = await conn.query('SELECT * FROM parking WHERE start_time <= NOW() AND end_time IS NULL;');
		rows.forEach((entry) => {
			/** Remove the nearest parking spot in a radius of 12m (the distance of two cars). */
			tree.RemoveNearest(GeographicToEuclidean({
				lat: entry.lat,
				lon: entry.lon,
			}), 12);
		});
		await conn.end();
		
		return res.json(tree.Query(GeographicToEuclidean({
				lat: lat,
				lon: lon,
		}), rad));
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Failed to fetch parking information near location" });
	}
});

app.listen(prt, () => console.log(`Backend running on port ${prt}`));
