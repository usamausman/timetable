import type { ClassInfo, PartialInfo } from 'src/global';

import { add } from 'date-fns';
import { createEvents } from 'ics';
import { get, writable } from 'svelte/store';

import { parseClass, toEvent } from '@helper/classes';
import { info, timetable } from '@helper/stores';
import { buildURL } from '@helper/util';

const defaultState = { fetching: false, downloading: false, error: false, message: '' };

export const state = writable(defaultState);

const parseURL = (url: string): PartialInfo => {
	if (!url) {
		throw new Error('No URL entered, please follow the steps again');
	}

	const params = new URLSearchParams(url);
	const identifier = params.get('identifier');
	const match = url.match(/teaching\/(\d+)\//);
	const year = match && match[1];

	if (!year || !identifier) {
		throw new Error('Incorrect URL, please follow the steps again');
	}

	return { year, identifier };
};

const retrieve = async ({ year, identifier }: PartialInfo): Promise<ClassInfo[]> => {
	let res;

	try {
		res = await fetch(buildURL(year, identifier));
	} catch {
		throw new Error('Timetable could not be fetched, please check your connection');
	}

	try {
		const text = await res.text();
		const parser = new DOMParser();
		const root = parser.parseFromString(text, 'text/html').body;

		// 1-indexed week, which is a Monday
		const startDate = add(
			new Date(Date.parse((root.querySelector('span.header-3-0-22') as HTMLElement).innerText)),
			{ days: -8 }
		);

		const weekdays = Array.from(root.querySelectorAll('table.spreadsheet')).map((e) =>
			Array.from(e.querySelectorAll('tr:not([class])')).map((el) => Array.from(el.children))
		);

		// put Sunday first
		weekdays.unshift(weekdays.pop());

		return weekdays.flatMap((classes, weekday) =>
			classes.flatMap((_class) => parseClass(_class, startDate, weekday, year))
		);
	} catch (err) {
		err.message = `Error while parsing timetable: ${err.message}`;
		throw err;
	}
};

const getTimetable = async (params: PartialInfo): Promise<ClassInfo[]> => {
	return retrieve(params).then((v) => new Promise((resolve) => setTimeout(() => resolve(v), 2500)));
};

const saveTimetable = (params: PartialInfo, classes: ClassInfo[]) => {
	info.update((o) => ({
		...o,
		year: params.year,
		identifier: params.identifier,
		lastFetched: new Date()
	}));
	timetable.set(classes);
};

const downloadTimetable = (params: PartialInfo, classes: ClassInfo[]) => {
	const year = Number(params.year.substring(0, 4));
	const name = `Leeds ${year}-${year + 1}`;

	const all = classes.flatMap((c) => toEvent(c, name));

	const { error, value: calendar } = createEvents(all);

	if (!error) {
		const a = document.createElement('a');
		a.href = 'data:text/calendar;charset=utf8,' + encodeURIComponent(calendar);
		a.download = name;
		a.click();
	}
};

export enum Action {
	GET,
	DOWNLOAD
}

const _parseAndDo = async (action: Action, params: PartialInfo) => {
	if (action === Action.GET) {
		state.update(() => ({ ...defaultState, fetching: true }));
		saveTimetable(params, await getTimetable(params));
		state.update(() => ({ ...defaultState, fetching: false }));
	} else if (action === Action.DOWNLOAD) {
		state.update(() => ({ ...defaultState, downloading: true }));
		downloadTimetable(params, await getTimetable(params));
		state.update(() => ({ ...defaultState, downloading: false }));
	}
};

export const doInfo = (action: Action, params: PartialInfo) => {
	_parseAndDo(action, params);
};

export const doURL = (action: Action, url: string) => {
	try {
		const params = parseURL(url);
		doInfo(action, params);
	} catch (err) {
		console.error(err);
		state.update(() => ({ ...defaultState, error: true, message: err.message }));
	}
};

export const refreshSaved = async () => {
	doInfo(Action.GET, get(info));
};

export const downloadSaved = () => {
	downloadTimetable(get(info), get(timetable));
};
