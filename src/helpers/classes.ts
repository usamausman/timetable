import { zonedTimeToUtc } from 'date-fns-tz';
import type { EventAttributes } from 'ics';
import type { ClassInfo } from 'src/global';

import { getLink, getLinks, getNewLinks, timetableURL } from '@helper/util';
import { add } from 'date-fns';

const getTag = (c: ClassInfo) => `${c.modules.map((m) => m.text).join(',')}@${c.time.getTime()}`;

export const getMethod = (method: string): string => {
	const m = method.toLowerCase().replace(/(\[\])/g, '');

	if (m.includes('on campus')) {
		return 'On Campus';
	} else if (m.includes('live') || m.includes('online')) {
		if (m.includes('collaborate')) return 'Online: Collaborate';
		if (m.includes('teams')) return 'Online: Teams';
		if (m.includes('zoom')) return 'Online: Zoom';
		if (m.includes('minerva')) return 'Online: See Minerva';
		return 'Online: Live';
	} else if (m.includes('pre-recorded')) {
		return 'Prerecorded: See Minerva';
	} else {
		return m;
	}
};

export const getTitle = (info: ClassInfo): string => {
	// should be of format module/module/type number
	if (info.title.split('/').length > info.modules.length) {
		const segment = info.title.split('/')[info.modules.length];
		let [type, number] = segment.toLowerCase().split(' ');

		number = number || '1';

		if (type === 'drop-in') return 'Drop-In ' + number;
		else if (type === 'lab') return 'Lab ' + number;
		else if (type === 'lec') return 'Lecture ' + number;
		else if (type === 'prc') return 'Practical ' + number;
		else if (type === 'smr') return 'Seminar ' + number;
		else if (type === 'tut') return 'Tutorial ' + number;
		// handle 01 JA
		else if (!isNaN(Number(type))) return info.title;
		else return segment;
	} else {
		return info.title;
	}
};

const makeTimes = (weeksEl, startDate, i, hours, minutes): Date[] => {
	const weeks = weeksEl.innerText
		.split(', ')
		.flatMap((t) => {
			if (t.indexOf('-') !== -1) {
				const [from, to] = t.split('-').map(Number);
				return [...Array(to - from + 1)].map((_, i) => from + i);
			} else {
				return Number(t);
			}
		})
		.map((w) => {
			if (w <= 11) {
				return w + 6;
			} else if (w > 11 && w <= 22) {
				return w + 10;
			} else {
				return w + 14;
			}
		});

	return weeks.map((w) =>
		zonedTimeToUtc(add(startDate, { days: w * 7 + i, hours, minutes }), 'Europe/London')
	);
};

export const parseClass = (els, startDate, weekday, year): ClassInfo[] => {
	const _class = {} as ClassInfo;

	if (els[0].innerText.indexOf('[') !== -1) {
		const [_, title, method] = els[0].innerText.match(/(.*)\s*\[(.*)(\]|\})/);
		_class.title = title.trim();

		if (method.includes('-')) {
			_class.method = method;
		}
	} else {
		_class.title = els[0].innerText;
	}

	_class.modules = getLinks(els[1]);

	_class.moduleTitles = els[2].innerText
		.split(';')
		.map((s) => s.trim())
		.filter((t) => t);

	_class.location = getLink(els[3]);

	_class.alternativeTimes = getLink(els[4], false);

	if (_class.alternativeTimes && _class.alternativeTimes.link) {
		let link = _class.alternativeTimes.link;
		_class.alternativeTimes.link = timetableURL(year) + link.substring(link.indexOf('/Individual'));
	}

	const notes = els[5].innerText.split(';').map((t) => t.trim());
	_class.notes = els[5].innerText.trim() ? notes : undefined;

	_class.link = getNewLinks(els[6]);

	const [fromHour, fromMinute] = els[7].innerText.split(':').map(Number);
	const [toHour, toMinute] = els[8].innerText.split(':').map(Number);

	// _class.times = makeTimes(els[9], startDate, weekday, fromHour, fromMinute)
	_class.duration = toHour * 60 + toMinute - (fromHour * 60 + fromMinute);

	_class.teachers = els[10].innerHTML
		.replace(/&nbsp;/g, ' ')
		.trim()
		.split(';')
		.map((t) => t.split(',').reverse().join(' '))
		.filter((t) => t);

	// return _class
	return makeTimes(els[9], startDate, weekday, fromHour, fromMinute).map((time) => {
		return { ..._class, time };
	});
};

export const toEvent = (_class: ClassInfo, name: string): EventAttributes => {
	const options: EventAttributes = {
		start: [
			_class.time.getFullYear(),
			_class.time.getMonth() + 1,
			_class.time.getDate(),
			_class.time.getHours(),
			_class.time.getMinutes()
		],
		duration: {
			hours: Math.floor(_class.duration / 60),
			minutes: _class.duration % 60
		},
		location: (_class.location && _class.location.text) || undefined,
		calName: name
	};

	options.title = _class.moduleTitles.length > 0 ? _class.moduleTitles.join(', ') : '[no title]';
	options.title += ` - ${getTitle(_class)}`;

	if (_class.method) {
		options.title += ` (${getMethod(_class.method)})`;
	}

	const descriptionLines = [];

	let text = '';
	if (_class.modules.length === 1) text = 'Module: ';
	else text = 'Modules: ';
	text += _class.modules.map((m) => m.text).join(', ');
	descriptionLines.push(text);

	if (_class.teachers.length > 0) {
		let text = '';
		if (_class.teachers.length === 1) text = 'Teacher: ';
		else text = 'Teachers: ';
		text += _class.teachers.join(', ');
		descriptionLines.push(text);
	}

	if (_class.location && _class.location.link) {
		descriptionLines.push('Location: ' + _class.location.link);
	}

	if (_class.notes || _class.link) {
		descriptionLines.push('');
		if (_class.notes) {
			descriptionLines.push(_class.notes.join('\n'));
		}

		if (_class.link) {
			_class.link.forEach((l) => descriptionLines.push(`Link: ${l.text} (${l.link})`));
		}
	}

	if (_class.alternativeTimes) {
		descriptionLines.push('');
		descriptionLines.push('Alternative Times: ' + _class.alternativeTimes.link);
	}

	options.description = descriptionLines.join('\n');

	return options;
};

export const notify = async ({
	_class,
	minutesTill
}: {
	_class: ClassInfo;
	minutesTill: number;
}) => {
	if (minutesTill >= 0) {
		let title = _class.modules.map((m) => m.text).join(', ');
		if (minutesTill > 0) {
			title += ` starts in ${minutesTill} minute${minutesTill === 1 ? '' : 's'}`;
		} else {
			title += ` has started`;
		}

		const reg = await navigator.serviceWorker.getRegistration();

		const options = {
			tag: getTag(_class),
			body: 'No location given',
			icon: 'icon/badge.png',
			actions: []
		};

		if (_class.location.text) {
			options.body = `Go to ${_class.location.text}`;
			// options.actions.push({
			//   action: 'directions',
			//   title: 'Directions',
			// })
		}

		reg.showNotification(title, options);
	}
};
