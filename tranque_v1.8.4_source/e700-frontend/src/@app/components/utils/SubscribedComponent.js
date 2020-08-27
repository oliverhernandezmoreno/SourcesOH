import {Component} from 'react';
import {interval, Subscription} from 'rxjs';

export default class SubscribedComponent extends Component {

    _subs = new Subscription();

    subscribe(obs, cb, errorCb, completeCb) {
        const subscription = obs.subscribe(cb, errorCb, completeCb);
        this._subs.add(subscription);
        return subscription;
    }

    /**
     * Call execute subscribption every <time> milliseconds
     * @param time interval time in milliseconds
     * @param obs observable to subscribe to
     * @param cb next callback
     * @param errorCb main error callback
     * @param completeCb main complete callback
     * @param beforeCb callback called before each interval execution
     * @returns {Observable} interval subscription
     */
    subscribeInterval(time, obs, cb, errorCb, completeCb, beforeCb) {
        const subFun = () => {
            if (typeof beforeCb === 'function') {
                beforeCb();
            }
            this.subscribe(obs, cb, errorCb, completeCb);
        };
        // Call once because interval waits before returning the first value
        subFun();
        // Set interval
        const intervalSub = interval(time).subscribe(subFun);
        this._subs.add(intervalSub);
        return intervalSub;
    }

    unsubscribeAll() {
        this._subs.unsubscribe();
        this._subs = new Subscription();
    }

    componentWillUnmount() {
        this.unsubscribeAll();
    }
}
