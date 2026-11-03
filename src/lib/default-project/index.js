import projectData from './project-data';

/* eslint-disable import/no-unresolved */
import overrideDefaultProject from '!arraybuffer-loader!./override-default-project.sb3';
import backdrop from '!raw-loader!./cd21514d0531fdffb22204e0ec5ed84a.svg';
import costume1 from '!raw-loader!./bcf454acf82e4504149f7ffe07081dbc.svg';
import costume2 from '!raw-loader!./0fb9be3e8397c983338cb71dc84d0b25.svg';
import meow from '!arraybuffer-loader!./83c36d806dc92327b9e7049a565c6bff.wav';
/* eslint-enable import/no-unresolved */
import {TextEncoder} from '../tw-text-encoder';

const defaultProject = translator => {
    if (overrideDefaultProject.byteLength > 0) {
        return [{
            id: 0,
            assetType: 'Project',
            dataFormat: 'JSON',
            data: overrideDefaultProject
        }];
    }

    let _TextEncoder;
    if (typeof TextEncoder === 'undefined') {
        _TextEncoder = require('text-encoding').TextEncoder;
    } else {
        _TextEncoder = TextEncoder;
    }
    const encoder = new _TextEncoder();

    const projectJson = projectData(translator);
    return [{
        id: 0,
        assetType: 'Project',
        dataFormat: 'JSON',
        data: JSON.stringify(projectJson)
    }, {
        id: 'cd21514d0531fdffb22204e0ec5ed84a',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(backdrop)
    }, {
        id: 'bcf454acf82e4504149f7ffe07081dbc',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume1)
    }, {
        id: '0fb9be3e8397c983338cb71dc84d0b25',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume2)
    }, {
        id: '83c36d806dc92327b9e7049a565c6bff',
        assetType: 'Sound',
        dataFormat: 'WAV',
        data: new Uint8Array(meow)
    }];
};

export default defaultProject;
