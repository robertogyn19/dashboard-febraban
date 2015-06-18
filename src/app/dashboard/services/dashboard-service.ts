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
    private _loading: boolean = true;
    private _lastRadius: number = 0;

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
    _lastQueryObservable = new Rx.BehaviorSubject<any>(null);
    _lastCircleObservable = new Rx.BehaviorSubject<L.LatLng>(null);
    _lastCensusObservable = new Rx.BehaviorSubject<Array<ICensusDocument>>(null);

    constructor(private $q:       ng.IQService,
          private $http:      ng.IHttpService,
          private $location:    ng.ILocationService,
          private $timeout:     ng.ITimeoutService,
          private $routeParams:   ng.route.IRouteParamsService) {
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

    get queryObservable():Rx.Observable<any> {
      return this._lastQueryObservable;
    }

    get circleObservable():Rx.Observable<L.LatLng> {
      return this._lastCircleObservable;
    }

    get censusObservable():Rx.Observable<Array<ICensusDocument>> {
      return this._lastCensusObservable;
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

    getRadius(): number {
      return this._lastRadius;
    }

    updateRadius(radius: number) {
      this._lastRadius = radius;
    }

    loadGeoJson() {
      return this.$http.get("san-francisco.geo.json");
    }

    updateDashboardData(point: L.LatLng) {
      this._lastCircleObservable.onNext(point);
    }

    crimesGeoAgg(geom: IGeom) {
      return this.getGogeoGeoAgg(geom, Configuration.getCrimesCollection(), "category");
    }

    businessGeoAgg(geom: IGeom) {
      return this.getGogeoGeoAgg(geom, Configuration.getBusinessCollection(), "state");
    }

    getGogeoGeoAgg(geom: IGeom, collectionName: string, field: string) {
      return new GogeoGeoagg(this.$http, geom, collectionName, field, this._lastRadius);
    }

    censusGeoSearch(geom: IGeom) {
      var fields = Configuration.getCensusFields();
      return new GogeoGeosearch(this.$http, geom, Configuration.getCensusCollection(), this._lastRadius, "kilometer", fields, 10);
    }

    updateCensus(geom: IGeom) {
      var ggsc = this.censusGeoSearch(geom);

      ggsc.execute((result: Array<ICensusDocument>) => {
        this._lastCensusObservable.onNext(result);
      });
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

    getTweet(latlng: L.LatLng, zoom: number, thematicQuery?: ThematicQuery) {
      return this.getTweetData(latlng, zoom, thematicQuery);
    }

    getDateHistogramAggregation() {
    }

    private getTweetData(latlng: L.LatLng, zoom: number, thematicQuery?: ThematicQuery) {
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

      // var query = this.composeQuery();
      // this._lastQueryObservable.onNext(query.requestData.q);
    }

    // composeQuery(): DashboardQuery {
    //   var query = new DashboardQuery(this.$http, this._lastGeomSpace);
    //   return query;
    // }
  }

  registerService(DashboardService);

}
