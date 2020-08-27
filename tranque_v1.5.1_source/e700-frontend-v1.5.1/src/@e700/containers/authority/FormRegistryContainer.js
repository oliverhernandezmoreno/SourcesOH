import React from 'react';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as FormService from '@app/services/backend/form';
import {Grid} from '@material-ui/core';
import FormMenu from '@e700/components/registry/FormMenu';
import history from '@app/history';
import {reverse, route} from '@app/urls';
import Cases from '@e700/components/registry/Cases';
import NewRequests from '@e700/components/registry/NewRequests';
import {Route, Switch} from 'react-router';
import {FormRegistry} from '@e700/components/registry/FormRegistry';
import {Redirect} from 'react-router-dom';
import {forkJoin} from 'rxjs';

const urlOptions = [
    'all',
    'received',
    'reviewed-no-comments',
    'reviewed-with-comments',
    'not-received',
    'generated-cases',
    'new-requests'
];
const urlMap = urlOptions.reduce((acc, o) => ({...acc, [reverse(`e700.registry.${o}`)]: o}), {});

export class FormRegistryContainer extends SubscribedComponent {

    state = {
        loading: true,
        instances: [],
        cases: [],
        natural_key: ''
    };

    goTo = filter => {
        return () => {
            history.push(reverse(`e700.registry.${filter}`));
        };
    };

    onInstanceCreate = (newInstance) => {
        this.setState(state => ({instances: [newInstance, ...state.instances]}));
    };

    componentDidMount() {
        this.subscribe(
            forkJoin(
                {
                    instances: FormService.listAllInstances({form_codename: 'e700'}),
                    cases: FormService.listAllCases()
                }
            ),
            ({instances, cases}) => {
                instances.sort((a, b) => b.period.localeCompare(a.period));
                this.setState({instances, cases, loading: false});
            }
        );
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.setState({natural_key: ''});
        }
    }

    selectRegion = (regionValue) => {
        const value = regionValue === '' ? '' : regionValue.natural_key;
        this.setState({natural_key: value});
    };

    onRequestUpdate = (id, request) => {
        this.setState(state => ({
            instances: state.instances.map(i => i.id === id ? {
                ...i,
                form_requests: [request, ...i.form_requests.slice(1)]
            } : i)
        }));
    };

    render() {
        const {location} = this.props;
        let {instances, cases, natural_key, loading} = this.state;
        const listFilter = urlMap[location ? location.pathname : ''];

        return (

            <Grid container spacing={1}>
                <Grid item xs={11} sm={3} md={3}>
                    <FormMenu
                        setFilter={this.goTo}
                        instances={instances}
                        selectedlistFilter={listFilter}
                        cases={cases}
                    />
                </Grid>
                <Grid item xs sm={9} md={9}>
                    <Switch>
                        <Route
                            path={route('e700.registry.new-requests')}
                            render={() => (
                                <NewRequests
                                    loading={loading}
                                    instances={natural_key !== '' ? instances.filter(e => e.zone.natural_key.startsWith(natural_key)) : instances}
                                    name={'Solicitudes'}
                                    onRequestUpdate={this.onRequestUpdate}
                                    listFilter={listFilter}
                                    selectRegion={this.selectRegion}
                                />
                            )}/>
                        <Route
                            path={route('e700.registry.generated-cases')}
                            render={() => (
                                <Cases
                                    loading={loading}
                                    cases={natural_key !== '' ? cases.filter(e => e.zone.startsWith(natural_key)) : cases}
                                    name={'Casos generados'}
                                    listFilter={listFilter}
                                    selectRegion={this.selectRegion}
                                />
                            )}/>
                        <Route
                            exact
                            path={route('e700.registry')}
                            render={() => <Redirect to={reverse('e700.registry.all')}/>}/>
                        <Route path={route('e700.registry')} render={() => (
                            <FormRegistry
                                loading={loading}
                                onInstanceCreate={this.onInstanceCreate}
                                instances={natural_key !== '' ? instances.filter(e => e.zone.natural_key.startsWith(natural_key)) : instances}
                                listFilter={listFilter}
                                selectRegion={this.selectRegion}
                            />
                        )}/>
                    </Switch>
                </Grid>
            </Grid>
        );
    }
}
