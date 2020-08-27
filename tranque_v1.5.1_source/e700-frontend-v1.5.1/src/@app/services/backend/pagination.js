import {map, mergeMap} from 'rxjs/operators';
import {forkJoin, Observable, of, Subscription} from 'rxjs';

/**
 * Request all paginated data from a given endpoint. Iterating to request all pages.
 * if options.streamPages is true: next callback will be executed passing
 * an object with the page number, the total count, and the page data
 * {page: <page param>, total:<response.count>, data: <response.results>}
 * if options.streamPages is false (default): next callback will be executed once at the end of all requests
 * passing to it the resulting data array
 */
export const handleListPagination = (options, list) => {
    const opts = {
        page_size: 50, //django's default
        streamPageResults: false,
        ...options,
        page: 1
    };
    return list(opts).pipe(
        mergeMap((firstRes) => {
            if (firstRes.count === firstRes.results.length) {
                if (opts.streamPageResults) {
                    return of({
                        total: firstRes.count,
                        page: 1,
                        data: firstRes.results
                    });
                } else {
                    return of(firstRes.results);
                }
            } else {
                const pageCount = Math.ceil(firstRes.count / opts.page_size);
                const obs = [];
                for (let i = 2; i <= pageCount; i++) {
                    obs.push(list({...opts, page: i}));
                }
                if (opts.streamPageResults) {
                    return new Observable((subscriber) => {
                        subscriber.next({
                            total: firstRes.count,
                            page: 1,
                            data: firstRes.results
                        });
                        const subs = new Subscription();
                        const completed = [];
                        obs.forEach((o, index) => {
                            subs.add(o.subscribe(
                                partialRes => {
                                    subscriber.next({
                                        total: partialRes.count,
                                        page: index + 2,
                                        data: partialRes.results
                                    });
                                },
                                undefined,
                                () => {
                                    completed.push(index);
                                    if (completed.length === obs.length) {
                                        subscriber.complete();
                                    }
                                }
                            ));
                        });
                        return () => {
                            subs.unsubscribe();
                        };
                    });
                } else {
                    return forkJoin(obs).pipe(map((res) => {
                        const ret = res.map(data => data.results);
                        ret.unshift(firstRes.results);
                        return ret.flat();
                    }));
                }
            }
        })
    );
};
