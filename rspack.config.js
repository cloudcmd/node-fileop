import {readFileSync} from 'node:fs';
import path from 'node:path';
import {env} from 'node:process';

const root = import.meta.dirname;
const dir = './client';
const isDev = env.NODE_ENV === 'development';

const dist = path.resolve(root, 'dist');
const distDev = path.resolve(root, 'dist-dev');
const devtool = isDev ? 'eval' : 'source-map';

const targets = readFileSync(path.join(root, '.browserslistrc'), 'utf8')
    .split('\n')
    .filter(Boolean);

const rules = [{
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'builtin:swc-loader',
    type: 'javascript/auto',
    options: {
        env: {
            targets,
        },
    },
}];

export default {
    devtool,
    entry: {
        fileop: `${dir}/fileop.js`,
    },
    output: {
        library: {
            name: 'fileop',
            type: 'var',
            export: 'default',
        },
        filename: '[name].js',
        path: isDev ? distDev : dist,
        pathinfo: isDev,
        devtoolModuleFilenameTemplate,
    },
    module: {
        rules,
    },
    optimization: {
        chunkIds: 'natural',
    },
};

function devtoolModuleFilenameTemplate(info) {
    const resource = info.absoluteResourcePath.replace(root + path.sep, '');
    return `file://fileop/${resource}`;
}
