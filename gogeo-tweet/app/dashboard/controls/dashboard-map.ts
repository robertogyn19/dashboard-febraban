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
    tweetResult: ITweet;
    popup: L.Popup;
    query: any = { query: { filtered: { filter: { } } } };
    selected: string = "inactive";
    mapTypes: Array<string> = [ "point", "cluster", "intensity" ];
    mapSelected: string = "point";
    geoJson: L.GeoJSON = null;
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

      this.service.loadGeoJson().success((feature) => {
        var geojson = {
          type: "FeatureCollection",
          features: [ feature ]
        };

        var options = {
          style: function(feature) {
            return {
              fill: true,
              fillOpacity: 0.3,
              fillColor: "#D8D8D8",
              color: "black",
              weight: 2
            }
          }
        };

        this.geoJson = L.geoJson(geojson, options);
        this.geoJson.addTo(this.map);
        this.geoJson.on("click", (e) => this.openPopup(e));
      });

      this.baseLayers.addLayer(this.getDayMap());
      this.map.addLayer(this.baseLayers);

      this.map.on("moveend", (e) => this.onMapLoaded());
      this.map.on("click", (e) => this.openPopup(e));

      this.initializeLayer();
      this.circlesGroup = new L.FeatureGroup();
      this.map.addLayer(this.circlesGroup);

      Rx.Observable
        .merge<any>(this._selectedMap)
        .throttle(800)
        .subscribe(() => {
          this.metrics.publishMapTypeMetric(this.mapSelected);
        });

        this.centerMap(37.76, -122.450);
    }

    initializeLayer() {
      this.map.addLayer(this.layerGroup);

      var layers = this.createLayers();
      for (var i in layers) {
        this.layerGroup.addLayer(layers[i]);
      }

      this.service.queryObservable
        .where(q => q != null)
        .throttle(400)
        .subscribeAndApply(this.$scope, (query) => this.queryHandler(query));

      this.service.tweetObservable
        .subscribeAndApply(this.$scope, (tweet) => this.handlePopupResult(tweet));
    }

    private centerMap(lat: number, lng: number) {
      if (lat && lng) {
        var center = new L.LatLng(lat, lng);
        this.map.setView(center, 15);
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

    private createLayers(): Array<L.ILayer> {
      var url = this.configureUrl();
      var options = {
        subdomains: Configuration.subdomains,
        maptiks_id: this.mapSelected
      };

      if (["point", "intensity"].indexOf(this.mapSelected) != (-1)) {
        return [L.tileLayer(url, options)];
      } else if (this.mapSelected === 'cluster') {
        return [this.createClusterLayer(url)];
      }
    }

    private configureUrl(): string {
      var database = Configuration.getDatabaseName();
      var collection = Configuration.getCollectionName();
      var buffer = 8;
      var stylename = "gogeo_many_points";
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
        + serviceName + "?buffer=" + buffer +
        "&stylename=" + stylename + "&mapkey=123";

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

      this.metrics.publishSwitchBaseLayer(this.baseLayerSelected);
      this.baseLayers.bringToBack();
    }

    onMapLoaded() {
      this.service.updateGeomSpaceByBounds(this.map.getBounds());
    }

    hidePopup() {
      this.map.closePopup(this.popup);
      this.tweetResult = null;
    }

    openPopup(levent: any) {
      if (!this.canOpenPopup) {
        return;
      }

      this.circlesGroup.clearLayers();

      var point = levent.latlng;
      var radius = this.service.getRadius();
      var circle = L.circle(point, radius * 1000);

      circle.on("click", (e) => this.openPopup(e));

      console.log("Using radius", radius);

      this.circlesGroup.addLayer(circle);
      this.service.updateDashboardData(point);
    }

    private handlePopupResult(result: Array<ITweet>) {
      if (!result || result.length == 0) {
        return;
      }

      this.tweetResult = result[0];

      if (!this.tweetResult) {
        return;
      }

      if (this.popup == null) {
        var options = {
          closeButton: false,
          className: "marker-popup",
          offset: new L.Point(-200, -272)
        };
        this.popup = L.popup(options);
        this.popup.setContent($("#tweet-popup")[0]);
      } else {
        this.popup.setContent($("#tweet-popup")[0]);
        this.popup.update();
      }

      this.popup.setLatLng(this.levent.latlng);
      this.map.openPopup(this.popup);
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