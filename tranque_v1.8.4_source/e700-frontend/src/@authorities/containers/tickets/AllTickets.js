import React, {Component} from 'react';
import {Switch, Route} from 'react-router';
import {Redirect} from 'react-router-dom';
import {reverse, route} from '@app/urls';
import C40X from '@app/components/utils/C40X';
import TicketRoot from '@alerts_events/containers/TicketRoot';
import LinkTabs from '@app/components/utils/LinkTabs';


function TicketsList(scope) {
    const subtitle = (
        scope === 'ef' ?
            'Estabilidad física del depósito' :
            'Aguas circundantes al depósito'
    );
    return (props) => (
        <TicketRoot {...props}
            group={scope}
            subtitle={subtitle}
            basePath={'authorities.tickets.' + scope}
            openPath={'authorities.tickets.' + scope + '.open.target.detail'}
            archivedPath={'authorities.tickets.' + scope + '.archived.target.detail'}
            unevaluablePath={'authorities.tickets.' + scope + '.unevaluable.target.detail'}
            closedPath={'authorities.tickets.' + scope + '.closed.target.detail'}
            newPath={'authorities.tickets.' + scope + '.new'}
        />
    );
}


class AllTickets extends Component {

    renderTabs() {
        const tabs = [
            {
                label: 'EF',
                to: reverse('authorities.tickets.ef')
            },
            {
                label: 'EMAC',
                to: reverse('authorities.tickets.emac')
            }
        ]
        return <LinkTabs tabs={tabs}/>;
    }

    render() {
        return (<>
            {this.renderTabs()}
            <Switch>
                <Route path={route('authorities.tickets.ef')}
                    render={TicketsList('ef')}/>
                <Route path={route('authorities.tickets.emac')}
                    render={TicketsList('emac')}/>
                <Route exact path={route('authorities.tickets')}
                    render={() =>
                        <Redirect to={{
                            pathname: reverse('authorities.tickets.ef.open')
                        }}/>
                    }/>
                <Route component={C40X}/>
            </Switch>
        </>);
    }
}

export default AllTickets;
