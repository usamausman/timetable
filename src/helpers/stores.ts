import { addMinutes, differenceInMinutes, startOfDay, startOfMinute } from 'date-fns';
import type { Writable } from 'svelte/store';
import { derived, readable, writable } from 'svelte/store';

import { browser } from '$app/environment';
import type { ClassInfo, Info, Options } from 'src/global';

export const defaultInfo: Info = {
	year: '',
	identifier: '',
	lastFetched: new Date(0)
};

export const defaultTimetable: ClassInfo[] = [];

export const defaultOptions: Options = {
	start: 9,
	end: 18,
	dark: browser && window.matchMedia('(prefers-color-scheme: dark)').matches,
	notifications: false,
	notificationsMinutesBefore: 5,
	refreshAfter: 7
};

const defaultModal = { component: null, props: {} };

const parseDate = (k, v) => {
	if (typeof v === 'string' && v.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)) {
		return new Date(v);
	}
	return v;
};

const localStore = (key, initial, parser = (k, v) => v, validate = (v) => true) => {
	const saved = JSON.parse(browser && localStorage.getItem(key), parser);
	const store = writable(saved || initial);
	store.subscribe((value) => {
		validate(value) && browser && localStorage.setItem(key, JSON.stringify(value));
	});
	return store;
};

export const time = readable(new Date(), (set) => {
	const interval = setInterval(() => set(new Date()), 100);

	return () => {
		clearInterval(interval);
	};
});

export const hour = derived(time, ($time) => $time.getHours());

export const minute = derived(time, ($time) => startOfMinute($time).getTime());

export const date = derived(time, ($time) => startOfDay($time).getTime());

export const modal = writable(defaultModal);

export const options: Writable<Options> = localStore(
	'options',
	defaultOptions,
	(k, v) => v,
	(v: Options) => v.start < v.end
);

export const info: Writable<Info> = localStore('info', defaultInfo, parseDate);

export const timetable: Writable<ClassInfo[]> = localStore(
	'timetable',
	defaultTimetable,
	parseDate
);

export const nextClass = derived(
	[minute, options, timetable],
	([$minute, $options, $timetable]) => {
		if ($options.notifications) {
			const checkTime = addMinutes($minute, $options.notificationsMinutesBefore);

			return $timetable
				.filter(
					(_class) =>
						addMinutes(checkTime, -$options.notificationsMinutesBefore) <= _class.time &&
						_class.time <= checkTime
				)
				.map((_class) => {
					const now = new Date($minute);
					const start = _class.time;

					return { _class, minutesTill: differenceInMinutes(start, now) };
				});
		}

		return [];
	}
);

export const line = derived(
	[time, options],
	([$time, $options]) =>
		($time.getHours() - $options.start + $time.getMinutes() / 60) / ($options.end - $options.start)
);

export const open = (component, props) =>
	modal.set({
		component,
		props
	});

export const close = () => modal.set(defaultModal);

export const resetAll = () => {
	close();
	info.set(defaultInfo);
	timetable.set(defaultTimetable);
};
