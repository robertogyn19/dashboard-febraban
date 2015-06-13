///<reference path="../../shell.ts" />
///<reference path="../../shared/controls/queries.ts"/>
///<reference path="../../shared/controls/dashboard-query.ts"/>
///<reference path="../../shared/controls/gogeo-geosearch.ts"/>
///<reference path="../../shared/controls/gogeo-geoagg.ts"/>
///<reference path="./metrics.ts"/>

/**
 * Created by danfma on 07/03/15.
 */

module gogeo {
  export interface TotalTweets {
    count: number;
  }

  export class DashboardService {
    static $named = "dashboardService";
    static $inject = [
      "$q",
      "$http",
      "$location",
      "$timeout",
      "$routeParams"
    ];

    private _lastGeomSpace:IGeomSpace = null;
    private _lastHashtagFilter:IBucket = null;
    private _lastSomethingTerms:string[] = [];
    private _lastPlaceString: string = null;
    private _lastDateRange: IDateRange = null;
    private _lastMapCenter: L.LatLng = null;
    private _lastMapZoom: number = 0;
    private _lastMapType: string = null;
    private _lastMapBase: string = null;
    private _loading: boolean = true;

    private worldBound: IGeom = {
      type: "Polygon",
      coordinates: [
        [
        [
          -201.09375,
          -81.97243132048264
        ],
        [
          -201.09375,
          84.86578186731522
        ],
        [
          201.09375,
          84.86578186731522
        ],
        [
          201.09375,
          -81.97243132048264
        ],
        [
          -201.09375,
          -81.97243132048264
        ]
        ]
      ]
    };

    _geomSpaceObservable = new Rx.BehaviorSubject<IGeomSpace>(null);
    _hashtagFilterObservable = new Rx.BehaviorSubject<IBucket>(null);
    _somethingTermsObservable = new Rx.BehaviorSubject<string[]>([]);
    _placeObservable = new Rx.BehaviorSubject<string>(null);
    _hashtagResultObservable = new Rx.BehaviorSubject<IHashtagResult>(null);
    _dateRangeObservable = new Rx.BehaviorSubject<IDateRange>(null);
    _lastQueryObservable = new Rx.BehaviorSubject<any>(null);
    _tweetObservable = new Rx.BehaviorSubject<Array<ITweet>>(null);
    _dateLimitObservable = new Rx.BehaviorSubject<any>(null);
    _placeBoundObservable = new Rx.BehaviorSubject<L.LatLngBounds>(null);
    _loadParamsObservable = new Rx.BehaviorSubject<any>(null);

    constructor(private $q:       ng.IQService,
          private $http:      ng.IHttpService,
          private $location:    ng.ILocationService,
          private $timeout:     ng.ITimeoutService,
          private $routeParams:   ng.route.IRouteParamsService) {

      this.initialize();
      this.loadParams();
    }

    private loadParams() {
      this._loadParamsObservable.onNext(this.$routeParams);

      this.$timeout(() => {
        this.$location.search({});
      }, 200);
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

    get hashtagFilterObservable():Rx.Observable<IBucket> {
      return this._hashtagFilterObservable;
    }

    get queryObservable():Rx.Observable<any> {
      return this._lastQueryObservable;
    }

    get dateRangeObsersable():Rx.Observable<IDateRange> {
      return this._dateRangeObservable;
    }

    get somethingTermsObservable():Rx.BehaviorSubject<string[]> {
      return this._somethingTermsObservable;
    }

    get placeObservable():Rx.BehaviorSubject<string> {
      return this._placeObservable;
    }

    get tweetObservable():Rx.BehaviorSubject<Array<ITweet>> {
      return this._tweetObservable;
    }

    get placeBoundObservable():Rx.BehaviorSubject<L.LatLngBounds> {
      return this._placeBoundObservable;
    }

    get loadParamsObservable():Rx.BehaviorSubject<any> {
      return this._loadParamsObservable;
    }

    initialize() {
      Rx.Observable
        .merge<any>(this._geomSpaceObservable, this._hashtagFilterObservable, this._dateRangeObservable)
        .throttle(400)
        .subscribe(() => this.search());

      Rx.Observable
        .merge<any>(this._somethingTermsObservable, this._placeObservable)
        .throttle(800)
        .subscribe(() => this.search());
    }

    private calculateNeSW(bounds: L.LatLngBounds) {
      var ne = new L.LatLng(bounds.getNorthEast().lng, bounds.getNorthEast().lat);
      var sw = new L.LatLng(bounds.getSouthWest().lng, bounds.getSouthWest().lat);

      return new NeSwPoint(ne, sw);
    }

    private pointToGeoJson(point: NeSwPoint): IGeomSpace {
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
        source: "mapBounds",
        type: "Polygon",
        coordinates: coordinates
      }
    }

    createShareLink(type: string) {
      var url = "?share";
      return url;
    }

    updateGeomSpace(geom: IGeomSpace) {
      this._loading = true;
      this._lastGeomSpace = geom;
      this._geomSpaceObservable.onNext(geom);
    }

    updateGeomSpaceByBounds(bounds: L.LatLngBounds) {
      var point = this.calculateNeSW(bounds);
      var geomSpace = this.pointToGeoJson(point);

      if (geomSpace) {
        this.updateGeomSpace(geomSpace);
      }
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
      if (place) {
        this._lastPlaceString = place;
      } else {
        this._lastPlaceString = null;
      }

      this._placeObservable.onNext(this._lastPlaceString);
    }

    updateDateRange(startDate: Date, endDate: Date) {
      var dateRange: IDateRange = null;

      if (startDate || endDate) {
        dateRange = { start: startDate, end: endDate };
      }

      this._lastDateRange = dateRange;
      this._dateRangeObservable.onNext(dateRange);
    }

    updateMapCenter(mapCenter: L.LatLng) {
      this._lastMapCenter = mapCenter;
    }

    updateMapZoom(mapZoom: number) {
      this._lastMapZoom = mapZoom;
    }

    updateMapType(mapType: string) {
      this._lastMapType = mapType;
    }

    updateMapBase(mapBase: string) {
      this._lastMapBase = mapBase;
    }

    getTopData() {
      var url = Configuration.makeUrl("aggregations", "stats");
      var q = this.composeQuery().requestData.q;

      var geom = this.getGeom();

      var options = {
        params: {
          mapkey: Configuration.getMapKey(),
          field: "value",
          group_by: "sum,city.raw",
          q: JSON.stringify(q),
          geom: JSON.stringify(geom)
        }
      };
      return this.$http.get(url, options);
    }

    getTweet(latlng: L.LatLng, zoom: number, thematicQuery?: ThematicQuery) {
      return this.getTweetData(latlng, zoom, thematicQuery);
    }

    getGeom() {
      var geom = {};

      if (this._lastGeomSpace) {
        geom = {
          type: "Polygon",
          coordinates: this._lastGeomSpace.coordinates
        };
      }

      return geom;
    }

    getDateHistogramAggregation() {
      var url = Configuration.makeUrl("aggregations", "date_histogram");
      var q = this.composeQuery().requestData.q;

      var geom = this.getGeom();

      var options = {
        params: {
          mapkey: Configuration.getMapKey(),
          field: Configuration.getDateField(),
          interval: Configuration.getInterval(),
          date_format: "YYYY-MM-DD",
          summary: "value",
          geom: JSON.stringify(geom),
          q: JSON.stringify(q)
        }
      };

      return this.$http.get<Array<IDateHistogram>>(url, options);
    }

    getStatsAggregationSummary() {
      var field = Configuration.getAggChartField();
      var groupBy = Configuration.getSummaryGroupBy();

      return this.getStatsAggregation(field, groupBy)
    }

    getStatsAggregationTypeEstab() {
      var field = Configuration.getAggChartField();
      var groupBy = Configuration.getTypeEstabGroupBy();

      return this.getStatsAggregation(field, groupBy)
    }

    getStatsAggregation(field: string, groupBy: string) {
      var url = Configuration.makeUrl("aggregations", "stats");
      var q = this.composeQuery().requestData.q;

      // console.log("-->", JSON.stringify(q, null, 2));

      var geom = this.getGeom();

      var options = {
        params: {
          mapkey: Configuration.getMapKey(),
          field: field,
          group_by: groupBy,
          q: JSON.stringify(q),
          geom: JSON.stringify(geom)
        }
      };

      return this.$http.get<Array<IStatsAgg>>(url, options);
    }

    private getTweetData(latlng: L.LatLng, zoom: number, thematicQuery?: ThematicQuery) {
      var pixelDist = 2575 * Math.cos((latlng.lat * Math.PI / 180)) / Math.pow(2, (zoom + 8));
      var query = this.composeQuery().requestData.q;

      if (thematicQuery) {
        query = thematicQuery.build();
      }

      var geom = <IGeom>{
        type: "Point",
        coordinates: [
          latlng.lng, latlng.lat
        ]
      };

      var geosearch = new GogeoGeosearch(this.$http, geom, pixelDist, "degree", Configuration.tweetFields(), 1, query);
      geosearch.execute((result: Array<ITweet>) => {
        this._tweetObservable.onNext(result);
      });
    }

    totalTweets() {
      var url = Configuration.getTotalTweetsUrl();
      return this.$http.get(url);
    }

    search() {
      if (!this._lastGeomSpace) {
        return;
      }

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
        query.filterByHashtag(this._lastHashtagFilter);
      }

      if (this._lastSomethingTerms.length > 0) {
        query.filterBySearchTerms(this._lastSomethingTerms);
      }

      if (this._lastPlaceString) {
        query.filterByPlace(this._lastPlaceString);
      }

      if (this._lastDateRange) {
        query.filterByDateRange(this._lastDateRange);
      }

      return query;
    }
  }

  registerService(DashboardService);

}
