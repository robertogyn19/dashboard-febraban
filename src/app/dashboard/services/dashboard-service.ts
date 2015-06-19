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

    _lastQueryObservable = new Rx.BehaviorSubject<any>(null);
    _lastCircleObservable = new Rx.BehaviorSubject<L.LatLng>(null);
    _lastCensusObservable = new Rx.BehaviorSubject<Array<ICensusDocument>>(null);
    _lastCrimesObservable = new Rx.BehaviorSubject<IGogeoGeoAgg>(null);

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

    get queryObservable():Rx.Observable<any> {
      return this._lastQueryObservable;
    }

    get circleObservable():Rx.Observable<L.LatLng> {
      return this._lastCircleObservable;
    }

    get censusObservable():Rx.Observable<Array<ICensusDocument>> {
      return this._lastCensusObservable;
    }

    get crimesObservable():Rx.Observable<IGogeoGeoAgg> {
      return this._lastCrimesObservable;
    }

    getRadius(): number {
      return this._lastRadius;
    }

    updateRadius(radius: number) {
      this._lastRadius = radius;
    }

    updateDashboardData(point: L.LatLng) {
      this._lastCircleObservable.onNext(point);
    }

    crimesGeoAgg(geom: IGeom) {
      return this.getGogeoGeoAgg(geom, Configuration.getCrimesCollection(), Configuration.getCrimesCategory());
    }

    updateCrimesAgg(geom: IGeom) {
      var geoagg = this.crimesGeoAgg(geom);

      geoagg.execute((result: IGogeoGeoAgg) => {
        this._lastCrimesObservable.onNext(result);
        this.updateCrimesDateHistogram(geom, result);
      });
    }

    updateCrimesDateHistogram(geom: IGeom, result: IGogeoGeoAgg) {
      var queries: Array<MatchPhraseQuery> = [];

      result.buckets.slice(0, 5).forEach((item: IBucket) => {
        var matchQuery = new MatchPhraseQuery(Configuration.getCrimesCategory(), item.key);
        queries.push(matchQuery);
      });

      var boolQuery = new BoolQuery();

      queries.forEach((q: Query) => {
        boolQuery.addMustQuery(q);
      });

      console.log("matchQuery", JSON.stringify(boolQuery.build(), null, 2));
      console.log();

      var point = <IPoint>geom;

      console.log("geom", point.coordinates);

      var options = {
        center: {
          x: point.coordinates[0],
          y: point.coordinates[1]
        }
      };
      var radius = (this._lastRadius / 100);

      // console.log("********** radius", radius);

      Hexagonal.precision(15);

      var hexagon = Hexagonal.Hexagon.byRadius(radius, options);
      // console.log("hexagon", hexagon.vertices());
      // var teste = new Hexagonal.Hexagon.byRadius();
      var coordinates = [];

      hexagon.vertices().forEach((vertex: Vertex) => {
        // console.log("vertex", vertex);
        coordinates.push([vertex.x, vertex.y]);
      });

      coordinates.push([hexagon.vertices()[0].x, hexagon.vertices()[0].y]);

      var hexGeoJson = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [coordinates]
        }
      };

      // console.log("hexGeoJson", JSON.stringify(hexGeoJson, null, 2));
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
  }

  registerService(DashboardService);
}