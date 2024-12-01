export interface Coordinates {
	x: number;
	y: number;
}

export interface Chapter {
	name: string;
	marinesCount: string;
	world: string;
}

export interface SpaceMarine {
	id: string;
	name: string;
	coordinates: Coordinates;
	health: number;
	height: number;
	category: string;
	weaponType: string;
	chapter: Chapter;
}
