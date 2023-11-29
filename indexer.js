const fs = require('fs');
const path = require('path');
const mime = require('mime');

// TODO: chokidar + build step

const index = {};
const categories = [
	'percussion',
	'strings',
	'woodwinds',
	'brass',
	'keyboards',
];

function isScientificPitchNotation(s) {
	return s.match(/^[A-F](-1|[0-9]|10)$/);
}

function isPitched(files) {
	for (let f of files) {
		const basename = path.basename(f);
		const withoutExt = basename.replace(/\.[^/.]+$/, "");
		if (isScientificPitchNotation(withoutExt)) return true;
	}

	return false;
}

function addInstrument(category, instrument) {
	const files = fs.readdirSync(path.join('static', category, instrument));
	index[category] = index[category] || {};
	index[category][instrument] = {
		pitched: isPitched(files),
		files: files.filter(f => mime.getType(f).startsWith('audio/')),
	};
}

function main() {
	categories.forEach(c => {
		const p = path.join('static', c);
		if (!fs.existsSync(p)) return;
		fs.readdirSync(p).forEach(i => addInstrument(c, i));
		fs.writeFileSync(path.join('static', 'instruments.json'), JSON.stringify(index, null, 2));
	});
}

main();

module.exports = main;
