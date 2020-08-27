import React from 'react';
import theme from '@communities/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';

import TargetSearcher from '@communities/components/home/TargetSearcher';
import {ZONEINFO as zoneInfo} from 'stories/data/zoneInfo';
import {parseZoneOptions} from '@app/services/backend/zone';

const zones = parseZoneOptions(zoneInfo);

const divStyle = {background: 'linear-gradient(180deg, #36ADDC 0%, #007FBD 100%)'};

storiesOf('Communities/TargetSearcher', module)
    .addDecorator(muiTheme([theme]))
    .addParameters({ component: TargetSearcher,
        info: 'Se utiliza un "div" con fondo de color para visualizar mejor el componente, ' +
              'es decir, el fondo no es parte del componente TargetSearcher.' })
    .add('Example', () => (<div style={divStyle}>
        <TargetSearcher test regions={zones} />
    </div>))
