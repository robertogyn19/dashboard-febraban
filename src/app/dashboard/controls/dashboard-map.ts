/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
/// <reference path="../services/metrics.ts" />

/**
 * Created by danfma on 07/03/15.
 */


module gogeo {

  class DashboardMapController {
    static $inject = [
      "$scope",
      "$timeout",
      DashboardService.$named,
      MetricsService.$named
    ];

    map: L.Map;
    popup: L.Popup;
    query: any = { query: { filtered: { filter: { } } } };
    selected: string = "inactive";
    mapTypes: Array<string> = [ "point", "cluster", "intensity" ];
    mapSelected: string = "point";
    baseLayers: L.FeatureGroup<L.ILayer> = null;
    layerGroup: L.LayerGroup<L.ILayer> = null;
    circlesGroup: L.FeatureGroup<L.ILayer> = null;
    restricted: boolean = false;
    canOpenPopup: boolean = true;
    baseLayerSelected: string = "day";
    levent: any = null;
    _selectedMap = new Rx.BehaviorSubject<string>(null);

    constructor(
          private $scope:     ng.IScope,
          private $timeout:   ng.ITimeoutService,
          private service:    DashboardService,
          private metrics:    MetricsService) {
      this.layerGroup = L.layerGroup([]);
      this.baseLayers = L.featureGroup([]);
    }

    initialize(map: L.Map) {
      this.map = map;

      this.baseLayers.addLayer(this.getDayMap());
      this.map.addLayer(this.baseLayers);

      this.map.on("moveend", (e) => this.onMapLoaded());
      this.map.on("click", (e) => this.addCircle(e));

      this.initializeLayer();
      this.circlesGroup = new L.FeatureGroup();
      this.map.addLayer(this.circlesGroup);
      this.centerMap(37.76, -122.450);
    }

    initializeLayer() {
      this.map.addLayer(this.layerGroup);

      layers = this.createLayers([ Configuration.getCensusCollection() ], "gogeo_default");
      for (var i in layers) {
        this.map.addLayer(layers[i]);
      }

      var layers = this.createLayers();
      for (var i in layers) {
        this.layerGroup.addLayer(layers[i]);
      }

      this.service.queryObservable
        .where(q => q != null)
        .throttle(400)
        .subscribeAndApply(this.$scope, (query) => this.queryHandler(query));
    }

    private centerMap(lat: number, lng: number) {
      if (lat && lng) {
        var center = new L.LatLng(lat, lng);
        this.map.setView(center, 12);
      }
    }

    private getNightMap() {
      var mapOptions = {
        // How you would like to style the map. 
        // This is where you would paste any style found on Snazzy Maps.
        styles: [
          { "stylers": [ { "visibility": "simplified" } ] },
          { "stylers": [ { "color": "#131314" } ] },
          {
            "featureType": "water",
            "stylers": [ { "color": "#131313" }, { "lightness": 7 } ]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [ { "visibility": "on" }, { "lightness": 25 } ]
          }
        ]
      };

      var options = {
        mapOptions: mapOptions,
        maptiks_id: "night-map"
      };

      return new L.Google("ROADMAP", options);
    }

    private getDayMap() {
      return new L.Google('ROADMAP', { maptiks_id: "day-map" });
    }

    private blockClick() {
      this.canOpenPopup = false;
    }

    private allowClick() {
      this.canOpenPopup = true;
    }

    private queryHandler(query: any) {
      if (JSON.stringify(query) !== JSON.stringify(this.query)) {
        this.query = query;
        this.updateLayer();
      } else {
        // same query, don't update the map
      }
    }

    private createLayers(layers?: Array<string>, stylename?: string): Array<L.ILayer> {
      if (!layers) {
        layers = [
          Configuration.getBusinessCollection()
        ];
      }

      if (!stylename) {
        stylename = "gogeo_many_points";
      }

      var array = [];

      layers.forEach((layerName) => {
        var url = this.configureUrl(layerName, stylename);
        var options = {
          subdomains: Configuration.subdomains,
          maptiks_id: this.mapSelected
        };

        if (["point", "intensity"].indexOf(this.mapSelected) != (-1)) {
          array.push(L.tileLayer(url, options));
        } else if (this.mapSelected === 'cluster') {
          array.push(this.createClusterLayer(url));
        }
      });

      return array;
    }

    private configureUrl(collection: string, stylename?: string): string {
      var database = Configuration.getDatabaseName();
      var buffer = 8;
      var serviceName = "tile.png";

      if (this.mapSelected === "cluster") {
        serviceName = "cluster.json";
      }

      if (this.mapSelected === "intensity") {
        stylename = "gogeo_intensity";
      }

      var url = "/map/"
        + database + "/" +
        collection + "/{z}/{x}/{y}/"
        + serviceName + "?buffer=" + buffer + "&mapkey=123";

      if (stylename) {
        url = url + "&stylename=" + stylename;
      }

      if (this.query) {
        url = `${url}&q=${encodeURIComponent(angular.toJson(this.query))}`;
      }

      return Configuration.prefixUrl(url);
    }

    switchBaseLayer() {
      this.baseLayers.clearLayers();

      if (this.baseLayerSelected === "day") {
        this.baseLayerSelected = "night";
        this.baseLayers.addLayer(this.getNightMap());
      } else {
        this.baseLayerSelected = "day";
        this.baseLayers.addLayer(this.getDayMap());
      }

      this.baseLayers.bringToBack();
    }

    onMapLoaded() {
      this.service.updateGeomSpaceByBounds(this.map.getBounds());
    }

    hidePopup() {
      this.map.closePopup(this.popup);
    }

    addCircle(levent: any) {
      if (!this.canOpenPopup) {
        return;
      }

      this.circlesGroup.clearLayers();

      var point = levent.latlng;
      var radius = this.service.getRadius();
      var circleOptions = {
        color: "red"
      };
      var circle = L.circle(point, radius * 1000, circleOptions);

      circle.on("click", (e) => this.addCircle(e));

      this.circlesGroup.addLayer(circle);
      this.service.updateDashboardData(point);
    }

    changeMapType(element: any) {
      this.mapSelected = element.target.id;
      this._selectedMap.onNext(this.mapSelected);

      if (this.mapSelected === "intensity" && this.baseLayerSelected === "day") {
        this.switchBaseLayer();
      }

      if (this.mapSelected === "point" && this.baseLayerSelected === "night") {
        this.switchBaseLayer();
      }

      this.updateLayer();
    }

    private updateLayer() {
      this.layerGroup.clearLayers();
      var layers = this.createLayers();

      for (var i in layers) {
        this.layerGroup.addLayer(layers[i]);
      }
    }

    private createClusterLayer(url): L.ILayer {
      var options = {
        subdomains: Configuration.subdomains,
        useJsonP: false
      };

      return new L.TileCluster(url, options);
    }
  }

  registerDirective("dashboardMap", [
    "$timeout",
    ($timeout: ng.ITimeoutService) => {
      return {
        restrict: "C",
        templateUrl: "dashboard/controls/dashboard-map-template.html",
        controller: DashboardMapController,
        controllerAs: "map",
        bindToController: true,

        link(scope, element, attrs, controller:DashboardMapController) {
          var center = new L.LatLng(37.757836, -122.447041);

          var options = {
            attributionControl: false,
            minZoom: 4,
            maxZoom: 18,
            center: center,
            zoom: 6,
            maptiks_id: "leaflet-map"
          };

          var mapContainerElement = element.find(".dashboard-map-container")[0];
          var map = L.map("map-container", options);

          controller.initialize(map);
          $timeout(() => map.invalidateSize(false), 1);

          scope.$on("$destroy", () => {
            map.remove();
          });
        }
      };
    }
  ]);

  registerDirective("errSrc", function() {
    return {
      link: function(scope, element, attrs) {
        element.bind("error", function() {
          if (attrs.src != attrs.errSrc) {
            attrs.$set("src", attrs.errSrc);
          }
        });
      }
    }
  });
}