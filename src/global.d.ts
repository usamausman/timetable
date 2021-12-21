/// <reference types="@sveltejs/kit" />

export interface PartialInfo {
	year: string;
	identifier: string;
}
export interface Info extends PartialInfo {
	lastFetched: Date;
}

export interface Options {
	start: number;
	end: number;
	dark: boolean;
	notifications: boolean;
	notificationsMinutesBefore: number;
	refreshAfter: number;
}

export interface Link {
	text: string;
	link: string;
}

export interface ClassInfo {
	title: string;
	method?: string;
	modules: Link[];
	moduleTitles?: string[];
	location?: string | Link;
	alternativeTimes?: Link;
	notes?: string[];
	link?: Link[];
	duration: number;
	teachers?: string[];
	time: Date;
}
