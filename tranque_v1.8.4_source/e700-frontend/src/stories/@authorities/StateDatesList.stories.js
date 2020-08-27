import React from 'react';

import theme from '@authorities/theme';
import { storiesOf } from '@storybook/react';
import { muiTheme } from 'storybook-addon-material-ui';

import { RED_ALERT, /*WITH_EVENTS,*/ YELLOW_ALERT, /*NOT_CONFIGURED,*/ WITHOUT_ALERT } from '@authorities/constants/indexState';
import StateDatesList from '@authorities/components/target/index/StateDatesList';

function getEqualDataItems(number) {
    let data = []
    for (var i = 0; i < number; i++) {
        data[i] = { date: 'Fri Nov 15 2019 00:00:00 GMT-0300 (Chile Summer Time)', indexValue: WITHOUT_ALERT };
    }
    return data;
}
const numberOfItems = 50;

const data = [{ date: 'Fri Nov 15 2019 00:00:00 GMT-0300 (Chile Summer Time)', indexValue: WITHOUT_ALERT },
    { date: 'Mon Oct 28 2019 00:00:00 GMT-0300 (Chile Summer Time)', indexValue: WITHOUT_ALERT },
    { date: 'Mon Jul 29 2019 23:00:00 GMT-0400 (Chile Standard Time)', indexValue: WITHOUT_ALERT },
    { date: 'Sat Jun 29 2019 23:00:00 GMT-0400 (Chile Standard Time)', indexValue: YELLOW_ALERT },
    { date: 'Thu May 30 2019 23:00:00 GMT-0400 (Chile Standard Time)', indexValue: WITHOUT_ALERT },
    { date: 'Fri Apr 19 2019 23:00:00 GMT-0400 (Chile Standard Time)', indexValue: RED_ALERT },
    { date: 'Sun Mar 24 2019 00:00:00 GMT-0300 (Chile Summer Time)', indexValue: YELLOW_ALERT },
    { date: 'Thu Feb 28 2019 00:00:00 GMT-0300 (Chile Summer Time)', indexValue: WITHOUT_ALERT },
    { date: 'Mon Jan 28 2019 09:00:00 GMT-0300 (Chile Summer Time)', indexValue: WITHOUT_ALERT },
    { date: 'Fri Dec 28 2018 09:00:00 GMT-0300 (Chile Summer Time)', indexValue: WITHOUT_ALERT }
];

const noData = [];
const oneCaseData = [{ date: 'Fri Nov 15 2019 00:00:00 GMT-0300 (Chile Summer Time)', indexValue: WITHOUT_ALERT }];
const muchData = getEqualDataItems(numberOfItems);

function handleDetailChange(event) {}

const manyItemsTitle = 'Many Items (' + numberOfItems + ')';

storiesOf('Authorities/StateDatesList', module)
    .addDecorator(muiTheme([theme]))
    .add('General Example', () => (<StateDatesList data={data}
        onSelect={handleDetailChange}
        selected={data[0]}  />))
    .add('No Data', () => (<StateDatesList data={noData}
        onSelect={handleDetailChange}  />))
    .add('One item (recent)', () => (<StateDatesList data={oneCaseData}
        onSelect={handleDetailChange}
        selected={oneCaseData[0]}  />))
    .add(manyItemsTitle, () => (<StateDatesList data={muchData}
        onSelect={handleDetailChange}
        selected={muchData[0]}/>))
