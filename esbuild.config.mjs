import { sep } from 'path'
import htmlPlugin from 'esbuild-plugin-template'
import copyPlugin from 'esbuild-copy-static-files'
import cssModulesPlugin from 'esbuild-css-modules-plugin'
import { readFileSync } from 'node:fs';

function template(result, initialOptions) {
		const outputs = (Object.keys(result?.metafile?.outputs ?? []));
		const stripBase = f => f.replace(initialOptions.outdir + sep, '');
		const stylesheets = outputs.filter(f => f.endsWith('.css')).map(stripBase);
		const scripts = outputs.filter(f => f.endsWith('.js')).map(stripBase);
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Dawesome</title>
	<link rel="icon" href="favicon.svg">
	<link rel="stylesheet" href="minireset.css" />
	${stylesheets.map(f => `<link rel="stylesheet" href="${f}"></script>`).join('\n')}
</head>
<body>
	<div id="root"></div>
	${scripts.map(f => `<script src="${f}"></script>`).join('\n')}
</body>
</html>`
	}

const htmlConfig = [
	{ filename: 'index.html', template },
	{ filename: 'settings.html', template },
	{ filename: 'instruments.html', template },
	{ filename: 'sequencer.html', template },
];

const outdir = 'dist';
const packageJson = JSON.parse(readFileSync('package.json'));

export const esbuildConfig = ({ isProd }) => ({
	entryPoints: ['src/main.tsx'],
	entryNames: `[dir]/[name]${isProd ? '.[hash]' : ''}`,
	define: {
		SAMPLE_URL: JSON.stringify('https://samples.dawesome.io'),
		APP_NAME: JSON.stringify(packageJson.name),
	},
	metafile: true,
	bundle: true,
	sourcemap: isProd ? 'external' : 'inline',
	minify: isProd,
	outdir,
	jsxFactory: 'h',
	jsxFragment: 'Fragment',
	loader: {
		'.svg': 'dataurl',
		'.png': 'file',
		'.jpg': 'file',
		'.gif': 'file',
		'.ttf': 'file',
		'.woff': 'file',
		'.woff2': 'file',
	},
	plugins: [
		cssModulesPlugin({
			pattern: '[name]_[local]',
			filter: /\.css$/,
		}),
		htmlPlugin(htmlConfig),
		copyPlugin({
			src: 'static',
			dest: outdir,
		}),
	],
})
