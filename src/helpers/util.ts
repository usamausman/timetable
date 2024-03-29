import { format } from 'date-fns';
import * as dateFnsTzPkg from 'date-fns-tz';
import type { Link } from 'src/global';
const { getTimezoneOffset } = dateFnsTzPkg;

export const timetableURL = (year) => `http://timetable.leeds.ac.uk/teaching/${year}/reporting`;

export const buildURL = (year, identifier) =>
	timetableURL(year) +
	`/textspreadsheet;?objectclass=student+set&idtype=id&identifier=${identifier}&template=SWSCUST+Student+Set+Individual+semester&days=1-7&periods=1-21&weeks=1-44`;

export const r = (a: number, b: number): number => Math.floor(Math.random() * (b - a)) + a;

export const showTime = (time: Date) =>
	time.getMinutes() === 0 ? format(time, 'h a') : format(time, 'p');

export const makeLink = ({ innerText: text, href: link = '' }): Link => {
	return { text: text.trim(), link };
};

export const getElements = (el, selector): HTMLElement[] =>
	Array.from(el.querySelectorAll(selector));

export const getLink = (el, required = true): Link => {
	const els = getElements(el, 'a');

	if (els.length) {
		return makeLink(els[0]);
	} else if (required) {
		return makeLink(el);
	}
};

export const getLinks = (el, required = true): Link[] => {
	const els = getElements(el, 'a');

	if (els.length) {
		return els.map(makeLink);
	} else if (required) {
		return el.innerText.split(';').map((t) => makeLink({ innerText: t }));
	}
};

export const getNewLinks = (el): Link[] => {
	const t = el.innerText.trim();
	let links = undefined;

	// if has links
	if (t[0] === '*') {
		const parts = t.substring(1).split(';'); // remove *
		links = [];

		if (parts.length > 1) {
			for (let i = 0; i < parts.length; i += 2) {
				links.push(makeLink({ innerText: parts[i + 1], href: parts[i] }));
			}
		}
	}

	return links;
};

export const timezoneOffsetToUK = (time: Date) => {
	const ukOffset = getTimezoneOffset('Europe/London', time);
	const hereOffset = getTimezoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone, time);
	const diffMinutes = (hereOffset - ukOffset) / 1000 / 60;

	return {
		hours: Math.floor(diffMinutes / 60),
		minutes: diffMinutes % 60
	};
};
