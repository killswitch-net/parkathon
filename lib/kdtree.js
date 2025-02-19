class kDTree {
	/**
	 * Extra dimensions on the points will be copied and returned when queried, 
	 * but they will not be taken into consideration when comparing (or in the metric)!
	 */
	constructor(dimensions = 2) {
		this.dimensions = dimensions;
		this.root = null;
	}
	
	/**
	 * Creates a new (unlinked) node, this function could be made static 
	 * if we pass the axis of the node instead of the depth!
	 *
	 * @typedef {Object} kDTreeNode
	 * @property {Array<kDTree.dimensions>} coords, The coordinates of the node in vector form.
	 * @property {kDTreeNode|null} l, The left (linked) node of the tree.
	 * @property {kDTreeNode|null} r, The right (linked) node of the tree.
	 * @property {number} a, The dimension/axis index for the specific node.
	 *
	 * @return {kDTreeNode} The newly created node for the tree.
	 */
	#CreateNode(point, depth) {
		return {
			coords: point,
			l: null,
			r: null,
			a: depth % this.dimensions,
		};
	}
	
	/**
	 * Same as `strcmp(stringA, stringB)` in C but for points!
	 */
	#CmpPoints(a, b) {
		for (let axis = 0; axis < this.dimensions; axis++) {
			if (Math.abs(a[axis] - b[axis]) > Number.EPSILON) {
				return a[axis] - b[axis];
			}
		}
		return 0;
	}
	
	#SquaredDistancePoints(a, b) {
		let result = 0;
		for (let axis = 0; axis < this.dimensions; axis++) {
			result += (a[axis] - b[axis]) ** 2;
		}
		return result;
	}
	
	/**
	 * Adds a new point to the tree.
	 * 
	 * @param {Array} An array/vector of numbers describing the point.
	 */
	InsertPoint(point) {
		if (this.root === null) {
			this.root = this.#CreateNode(point, 0);
			return;
		}

		let current = this.root;
		let depth = 0;
		
		while (true) {
			let axis = depth % this.dimensions;
			
			if (point[axis] < current.coords[axis]) {
				if (current.l === null) {
					current.l = this.#CreateNode(point, depth + 1);
					break;
				}
				current = current.l;
			} else {
				if (current.r === null) {
					current.r = this.#CreateNode(point, depth + 1);
					break;
				}
				current = current.r;
			}
			
			depth++;
		}
	}
	
	InsertPoints(points) {
		for (let i = 0; i < points.length; i++) {
			this.InsertPoint(points[i]);
		}
	}
	
	/**
	 * Ensures a point is inside the tree.
	 * 
	 * @param {Array} An array/vector of numbers describing the point.
	 */
	EnsurePoint(point) {
		if (this.root === null) {
			this.root = this.#CreateNode(point, 0);
			return;
		}

		let current = this.root;
		let depth = 0;
		
		while (true) {
			let axis = depth % this.dimensions;
			
			if (this.#CmpPoints(point, current.coords) == 0) {
				break;
			}
			
			if (point[axis] < current.coords[axis]) {
				if (current.l === null) {
					current.l = this.#CreateNode(point, depth + 1);
					break;
				}
				current = current.l;
			} else {
				if (current.r === null) {
					current.r = this.#CreateNode(point, depth + 1);
					break;
				}
				current = current.r;
			}
			
			depth++;
		}
	}
	
	EnsurePoints(points) {
		for (let i = 0; i < points.length; i++) {
			this.EnsurePoint(points[i]);
		}
	}
	
	/**
	 * Helper function that will recursively search and find the minimum point of a given axis.
	 * https://www.geeksforgeeks.org/deletion-in-k-dimensional-tree/
	 */
	#FindMin(current, axis, depth) {
		if (current == null) {
			return null;
		}
		
		if (axis === (depth % this.dimensions)) {
			return current.l ? this.#FindMin(current.l, axis, depth + 1) : current;
		}
		
		let l = this.#FindMin(current.l, axis, depth + 1);
		let r = this.#FindMin(current.r, axis, depth + 1);
		
		let result = current;
		if (l && l.coords[axis] < result.coords[axis]) result = l;
		if (r && r.coords[axis] < result.coords[axis]) result = r;
		
		return result;
	}
	
	/**
	 * Remove an existing point from the tree.
	 * 
	 * @param {Array} An array/vector of numbers describing the point.
	 *
	 * https://www.geeksforgeeks.org/deletion-in-k-dimensional-tree/
	 */
	RemovePoint(point) {
		const RemoveRecursive = (current, point, depth) => {
			if (current === null || point === null) {
				return null;
			}
			
			let axis = depth % this.dimensions;
			
			if (this.#CmpPoints(point, current.coords) == 0) {
				if (current.r !== null) {
					const other = this.#FindMin(current.r, axis, depth + 1);
					current.coords = other.coords;
					current.r = RemoveRecursive(current.r, other.coords, depth + 1);
				}
				else if (current.l !== null) {
					const other = this.#FindMin(current.l, axis, depth + 1);
					current.coords = other.coords;
					current.r = RemoveRecursive(current.l, other.coords, depth + 1);
					current.l = null;
				}
				else {
					return null;
				}
				
				return current;
			}
			
			if (point[axis] < current.coords[axis]) {
				current.l = RemoveRecursive(current.l, point, depth + 1);
			}
			else {
				current.r = RemoveRecursive(current.r, point, depth + 1);
			}
			
			return current;
		};
		
		this.root = RemoveRecursive(this.root, point, 0);
	}
	
	RemoveNearest(point, maxradius) {
		const nearest = this.Nearest(point, maxradius);
		if (nearest) {
			this.RemovePoint(nearest);
		}
	}
	
	/**
	 * Find the nearest point around another point in a radius.
	 * 
	 * @param {Array} An array/vector of numbers describing the point.
	 * @param {number} The radius we want to search around the point.
	 *
	 * @return {Array} An array of points that are within the radius.
	 */
	Nearest(point, radius) {
		let result = null, best = Infinity;
		let stack = [{ current: this.root, depth: 0 }];
		
		while (stack.length > 0) {
			const { current, depth } = stack.pop();

			if (current === null) {
				continue;
			}

			let axis = depth % this.dimensions;
			let dist = this.#SquaredDistancePoints(point, current.coords);

			if (dist <= radius * radius && dist < best) {
				result = current.coords;
				best = dist;
			}

			if (point[axis] - radius <= current.coords[axis]) {
				stack.push({ current: current.l, depth: depth + 1 });
			}

			if (point[axis] + radius >= current.coords[axis]) {
				stack.push({ current: current.r, depth: depth + 1 });
			}
		}

		return result;
	}
	
	/**
	 * Find all the points around another point in a radius.
	 * 
	 * @param {Array} An array/vector of numbers describing the point.
	 * @param {number} The radius we want to search around the point.
	 *
	 * @return {Array} An array of points that are within the radius.
	 */
	Query(point, radius) {
		let result = [];
		let stack = [{ current: this.root, depth: 0 }];
		
		while (stack.length > 0) {
			const { current, depth } = stack.pop();

			if (current === null) {
				continue;
			}

			let axis = depth % this.dimensions;

			if (this.#SquaredDistancePoints(point, current.coords) <= radius * radius) {
				result.push(current.coords);
			}

			if (point[axis] - radius <= current.coords[axis]) {
				stack.push({ current: current.l, depth: depth + 1 });
			}

			if (point[axis] + radius >= current.coords[axis]) {
				stack.push({ current: current.r, depth: depth + 1 });
			}
		}

		return result;
	}
};

export default kDTree;
