import tinycolor, { Instance as Color } from 'tinycolor2';

import percentOf from '@proton/shared/lib/helpers/percentOf';

function hue(percent: number) {
    return function (color: Color) {
        const hsl = color.toHsl();

        hsl.h = hsl.h + percentOf(percent, hsl.h);

        return tinycolor(hsl);
    };
}

export default hue;