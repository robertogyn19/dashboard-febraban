/// <reference path="../../shell.ts" />

/**
 * Created by danfma on 07/03/15.
 */

module gogeo {

    export interface Query {
        build(): any;
    }

    export class NeSwPoint {
        constructor(public ne:L.LatLng, public sw:L.LatLng) {

        }
    }

    export class TextQueryBuilder implements Query {
        static HashtagText = "entities.hashtags.text";
        static UserScreenName = "user.screen_name";
        static Text = "text";
        static Place = "place.country";

        constructor(public field: string, public term: string) {
        }

        build() {
            return {
                query: {
                    query_string: {
                        query: this.term,
                        fields: [
                            this.field
                        ]
                    }
                }
            };
        }
    }

    export class ThematicQuery implements Query {
        constructor(public queries: Array<Query>, public prevQuery?: TextQueryBuilder) {
        }

        build() {
            var query = {
                query: {
                    filtered: {
                        filter: {
                            or: {
                                // filters: []
                            }
                        }
                    }
                }
            };

            var filters = [];

            if (this.prevQuery) {
                query["query"]["filtered"]["query"] = this.prevQuery["query"];
            }

            for (var index in this.queries) {
                var stq = this.queries[index];

                if (stq instanceof SourceTermQuery || stq instanceof TextQueryBuilder) {
                    filters.push(stq.build());
                } else if (stq["query"]["filtered"]["filter"]["or"]["filters"]) {
                    var subFilters = stq["query"]["filtered"]["filter"]["or"]["filters"];
                    for (var k in subFilters) {
                        filters.push(subFilters[k]);
                    }
                }
            }
            
            query["query"]["filtered"]["filter"]["or"]["filters"] = filters;

            return query;
        }
    }

    export class DateRangeQueryBuilder implements Query {
        static DateRange = "created_at";

        constructor(public field: string, public range: IDateRange) {

        }

        build() {
            var query = {
                query: {
                    range : {}
                }
            };

            var fieldRestriction = query.query.range[this.field] = {};
            var range = this.range;

            if (range.start) {
                fieldRestriction["gte"] = this.format(range.start);
            }

            if (range.end) {
                fieldRestriction["lte"] = this.format(range.end);
            }

            return query;
        }

        format(date: Date) {
            return moment(date).format("YYYY-MM-DD");
        }
    }

    export class SourceTermQuery implements Query {

        constructor(public term: string) {

        }

        build() {
            return {
                query: {
                    term: {
                        source: this.term
                    }
                }
            }
        }
    }

    export interface IGeomSpace {
        type: string;
        coordinates: Array<Array<Array<number>>>;
    }

    export interface IBucket {
        key: string;
        doc_count: number;
    }

    export interface IHashtagResult {
        doc_total: number;
        buckets: Array<IBucket>;
    }

    export interface ITweet {
        created_at: string;
        id: string;
        text: string;
        source: string;
        truncated: boolean;
        in_reply_to_status_id: number;
        in_reply_to_user_id: number;
        in_reply_to_screen_name: string;
        retweet_count: number;
        favorite_count: number;
        favorited: boolean;
        retweeted: boolean;
        lang: string;
        timestamp_ms: number;
        "user.name": string;
        "user.screen_name": string;
        "user.profile_image_url": string;
    }

    export interface IDateRange {
        start: Date;
        end: Date;
    }

    export class DashboardService {
        static $named = "dashboardService";
        static $inject = [
            "$q",
            "$http",
            "$location",
            "Angularytics"
        ];

        private _lastGeomSpace:IGeomSpace = null;
        private _lastHashtagFilter:IBucket = null;
        private _lastSomethingTerms:string[] = [];
        private _lastPlace: string = null;
        private _lastDateRange: IDateRange = null;
        private _loading: boolean = true;

        _geomSpaceObservable = new Rx.BehaviorSubject<IGeomSpace>(null);
        _hashtagFilterObservable = new Rx.BehaviorSubject<IBucket>(null);
        _somethingTermsObservable = new Rx.BehaviorSubject<string[]>([]);
        _placeObservable = new Rx.BehaviorSubject<string>(null);
        _hashtagResultObservable = new Rx.BehaviorSubject<IHashtagResult>(null);
        _dateRange = new Rx.BehaviorSubject<IDateRange>(null);
        _lastQueryObservable = new Rx.BehaviorSubject<any>(null);

        constructor(private $q:ng.IQService,
                    private $http:ng.IHttpService,
                    private $location: ng.ILocationService,
                    private angularytics: angularytics.Angularytics) {

            this.initialize();

            if (this.$location.host().match("gogeo.io")) {
                this.angularytics.trackPageView("/");
            }
        }

        get loading(): boolean {
            return this._loading;
        }

        public isLoading(): boolean {
            return this._loading;
        }

        get geomSpaceObservable():Rx.Observable<IGeomSpace> {
            return this._geomSpaceObservable;
        }

        get hashtagResultObservable():Rx.Observable<IHashtagResult> {
            return this._hashtagResultObservable;
        }

        get queryObservable():Rx.Observable<any> {
            return this._lastQueryObservable;
        }

        initialize() {
            Rx.Observable
                .merge<any>(this._geomSpaceObservable, this._hashtagFilterObservable)
                .throttle(400)
                .subscribe(() => this.search());

            Rx.Observable
                .merge<any>(this._somethingTermsObservable, this._placeObservable, this._dateRange)
                .throttle(800)
                .subscribe(() => this.search());
        }

        private calculateNeSW(bounds: L.LatLngBounds) {
            var ne = new L.LatLng(bounds.getNorthEast().lng, bounds.getNorthEast().lat);
            var sw = new L.LatLng(bounds.getSouthWest().lng, bounds.getSouthWest().lat);

            return new NeSwPoint(ne, sw);
        }

        private pointToGeoJson(point: NeSwPoint):IGeomSpace {
            var ne = [point.ne.lat, point.ne.lng];
            var sw = [point.sw.lat, point.sw.lng];

            var nw = [sw[0], ne[1]];
            var se = [ne[0], sw[1]];

            var coordinates = [
                [
                    sw, nw, ne, se, sw
                ]
            ];

            return {
                type: "Polygon",
                coordinates: coordinates
            }
        }

        updateGeomSpace(geom: IGeomSpace) {
            this._loading = true;
            this._lastGeomSpace = geom;
            this._geomSpaceObservable.onNext(geom);
        }

        updateGeomSpaceByBounds(bounds: L.LatLngBounds) {
            var point = this.calculateNeSW(bounds);
            var geomSpace = this.pointToGeoJson(point);
            this.updateGeomSpace(geomSpace);
        }

        updateHashtagBucket(bucket: IBucket) {
            this._loading = true;
            this._lastHashtagFilter = bucket;
            this._hashtagFilterObservable.onNext(bucket);
        }

        updateSomethingTerms(terms: string[]) {
            this._loading = true;
            this._lastSomethingTerms = terms;
            this._somethingTermsObservable.onNext(terms);
        }

        updatePlace(place: string) {
            this._lastPlace = place;
            this._placeObservable.onNext(place);
        }

        updateDateRange(startDate: Date, endDate: Date) {
            var dateRange: IDateRange = null;

            if (startDate || endDate)
                dateRange = { start: startDate, end: endDate };

            this._lastDateRange = dateRange;
            this._dateRange.onNext(dateRange);
        }

        publishMetrics(action: string, category: string, label: string) {
            if (this.$location.host().match("gogeo.io")) {
                this.angularytics.trackEvent(action, category, label);
            }
        }

        getTweet(latlng: L.LatLng, zoom: number, thematicQuery?: ThematicQuery) {
            return this.getTweetData(latlng, zoom, thematicQuery);
        }

        private getTweetData(latlng: L.LatLng, zoom: number, thematicQuery?: ThematicQuery) {
            var url = Configuration.makeUrl("geosearch/db1/tweets?mapkey=123");
            var pixelDist = 2575 * Math.cos((latlng.lat * Math.PI / 180)) / Math.pow(2, (zoom + 8));
            var query = this.composeQuery().requestData.q;

            if (thematicQuery) {
                query = thematicQuery.build();
            }

            var data:any = {
                geom: {
                    type: "Point",
                    coordinates: [
                        latlng.lng, latlng.lat
                    ]
                },
                limit: 1,
                buffer: pixelDist,
                buffer_measure: "degree",
                fields: [
                    // user
                    "user.id",
                    "user.name",
                    "user.screen_name",
                    "user.location",
                    "user.url",
                    "user.description",
                    "user.followers_count",
                    "user.friends_count",
                    "user.listed_count",
                    "user.favourites_count",
                    "user.statuses_count",
                    "user.created_at",
                    "user.time_zone",
                    "user.geo_enabled",
                    "user.lang",
                    "user.profile_image_url",
                    // place
                    "place.id",
                    "place.url",
                    "place.place_type",
                    "place.full_name",
                    "place.country_code",
                    "place.country",
                    // tweet
                    "created_at",
                    "id",
                    "text",
                    "source",
                    "truncated",
                    "in_reply_to_status_id",
                    "in_reply_to_user_id",
                    "in_reply_to_screen_name",
                    "retweet_count",
                    "favorite_count",
                    "favorited",
                    "retweeted",
                    "possibly_sensitive",
                    "lang",
                    "timestamp_ms"
                ],
                q: angular.toJson(query) // Essa query e passada como string mesmo
            };

            return this.$http.post<ITweet>(url, data);
        }

        search() {
            this._loading = true;

            var query = this.composeQuery();

            query.execute(
                (result) => {
                    this._loading = false;
                    this._hashtagResultObservable.onNext(result);
                }
            );

            this._lastQueryObservable.onNext(query.requestData.q);
        }

        composeQuery(): DashboardQuery {
            var query = new DashboardQuery(this.$http, this._lastGeomSpace);

            if (this._lastHashtagFilter) {
                this.publishMetrics("click", "hashtags", this._lastHashtagFilter.key);
                query.filterByHashtag(this._lastHashtagFilter);
            }

            if (this._lastSomethingTerms.length > 0) {
                //this.publishMetrics("search", "search", this._lastSearchTerm);
                query.filterBySearchTerms(this._lastSomethingTerms);
            }

            if (this._lastPlace) {
                query.filterByPlace(this._lastPlace);
            }

            if (this._lastDateRange) {
                query.filterByDateRange(this._lastDateRange);
            }

            return query;
        }
    }

    class DashboardQuery {
        requestData: any = {};

        constructor(private $http: ng.IHttpService, geomSpace: IGeomSpace) {
            this.requestData = {
                agg_size: 10,
                field: "entities.hashtags.text",
                geom: geomSpace,
                q: {
                    query: {
                        filtered: {
                            filter: {}
                        }
                    }
                }
            };
        }

        getOrCreateAndRestriction(filter:any) {
            var and = filter["and"];

            if (!and) {
                and = filter.and = {
                    filters: []
                };
            }

            return and;
        }

        filterBySearchTerms(terms: string[]) {
            for (var i = 0; i < terms.length; i++) {
                this.filterBySearchTerm(terms[i]);
            }
        }

        filterBySearchTerm(term: string) {
            Enumerable.from(term.split(' '))
                .select(entry => entry.trim())
                .where(entry => entry != null && entry.length > 0)
                .forEach(entry => {
                    switch (entry.charAt(0)) {
                        case "@":
                            this.filterByUsername(entry.substring(1));
                            break;

                        case "#":
                            this.filterByHashtag({
                                key: entry.substring(1),
                                doc_count: 0
                            });
                            break;

                        default:
                            this.filterByText(term);
                            break;
                    }
                });
        }

        filterByHashtag(hashtag: IBucket) {
            var filter:any = this.requestData.q.query.filtered.filter;

            if (hashtag) {
                this.requestData["field"] = "place.full_name.raw";
                this.requestData["agg_size"] = 5;

                var and = this.getOrCreateAndRestriction(filter);
                var queryString = new TextQueryBuilder(TextQueryBuilder.HashtagText, hashtag.key);

                and.filters.push(queryString.build());
            }
        }

        filterByUsername(username: string) {
            var filter:any = this.requestData.q.query.filtered.filter;
            var and = this.getOrCreateAndRestriction(filter);
            var queryString = new TextQueryBuilder(TextQueryBuilder.UserScreenName, username + "*");

            and.filters.push(queryString.build());
        }

        filterByText(text: string) {
            var filter:any = this.requestData.q.query.filtered.filter;
            var and = this.getOrCreateAndRestriction(filter);
            var queryString = new TextQueryBuilder(TextQueryBuilder.Text, text);

            and.filters.push(queryString.build());
        }

        filterByPlace(text: string) {
            var filter:any = this.requestData.q.query.filtered.filter;
            var and = this.getOrCreateAndRestriction(filter);
            var queryString = new TextQueryBuilder(TextQueryBuilder.Place, text + "*");

            and.filters.push(queryString.build());
        }

        filterByDateRange(range: IDateRange) {
            var filter:any = this.requestData.q.query.filtered.filter;
            var and = this.getOrCreateAndRestriction(filter);
            var queryString = new DateRangeQueryBuilder(DateRangeQueryBuilder.DateRange, range);

            and.filters.push(queryString.build());
        }

        execute(resultHandler:(IHashtagResult) => void) {
            var url = Configuration.makeUrl("geoagg/db1/tweets?mapkey=123");

            return this.$http
                .post(url, this.requestData)
                .success(resultHandler);
        }
    }


    registerService(DashboardService);

}
