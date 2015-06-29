/**
 * Created by danfma on 09/03/15.
 */
///<reference path="./_references.d.ts"/>
var gogeo;
(function (gogeo) {
    gogeo.settings;
    var Configuration = (function () {
        function Configuration() {
        }
        Object.defineProperty(Configuration, "apiUrl", {
            get: function () {
                // return "maps.demos.gogeo.io/1.0/";
                return gogeo.settings["api.url"];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Configuration, "tileUrl", {
            get: function () {
                // return "{s}.demos.gogeo.io/1.0/";
                return gogeo.settings["tile.url"];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Configuration, "subdomains", {
            get: function () {
                // return [ "m01", "m02", "m03", "m04" ];
                return gogeo.settings["subdomains"];
            },
            enumerable: true,
            configurable: true
        });
        Configuration.makeUrl = function (path, collectionName, service) {
            if (!collectionName) {
                collectionName = Configuration.getCollectionName();
            }
            path = [path, Configuration.getDatabaseName(), collectionName, service].join("/");
            path = path.replaceAll("//", "/");
            return Configuration.prefixUrl(path);
        };
        Configuration.prefixUrl = function (path) {
            var serverUrl = Configuration.apiUrl;
            if (path.match(".*tile.png.*") || path.match(".*cluster.json.*") || path.match(".*aggregations.*")) {
                serverUrl = Configuration.tileUrl;
            }
            if (serverUrl && !serverUrl.endsWith("/")) {
                serverUrl = serverUrl + "/";
            }
            var url = "http://" + serverUrl + (path.startsWith("/") ? path.substring(1) : path);
            return url;
        };
        Configuration.getCensusFields = function () {
            return [
                "geo_id",
                "geo_id2",
                "families",
                "nonfamily",
                "households",
                "household_median_income",
                "white",
                "black",
                "indian",
                "asian",
                "hawaiian",
                "others",
                "two_races",
                "age_under_5",
                "age_5_19",
                "age_20_29",
                "age_30_44",
                "age_45_64",
                "age_85_over",
                "household_income_less_15k",
                "household_income_15k_35k",
                "household_income_35k_75k",
                "household_income_75k_150k",
                "household_income_150k_200k",
                "household_income_200k_more"
            ];
        };
        Configuration.getCollectionName = function () {
            return gogeo.settings["collection"];
        };
        Configuration.getBusinessCollection = function () {
            return "business";
        };
        Configuration.getCrimesCollection = function () {
            return "crimes";
        };
        Configuration.getCensusCollection = function () {
            return "census_sf";
        };
        Configuration.getCrimesCategory = function () {
            return "category";
        };
        Configuration.getMapKey = function () {
            // TODO: Export this to development/deployment config file
            return "123";
        };
        Configuration.getInterval = function () {
            // TODO: Export this to development/deployment config file
            return "day";
        };
        Configuration.getAggSize = function () {
            // TODO: Export this to development/deployment config file
            return 0;
        };
        Configuration.getDatabaseName = function () {
            // TODO: Export this to development/deployment config file
            return "demos";
        };
        Configuration.tweetFields = function () {
            // TODO: Export this to development/deployment config file
            return [
                "name",
                "amount",
                "company_name",
                "type",
                "place_type",
                "installment",
                "installments",
                "card_brand",
                "cnae",
                "cnae_label",
                "date"
            ];
        };
        return Configuration;
    })();
    gogeo.Configuration = Configuration;
    var mod = angular.module("gogeo", ["ngRoute", "nvd3", "vr.directives.slider", "angular-capitalize-filter"]).config([
        "$routeProvider",
        function ($routeProvider) {
            $routeProvider.when("/dashboard", {
                controller: "DashboardController",
                controllerAs: "dashboard",
                templateUrl: "dashboard/page.html",
                reloadOnSearch: false
            }).otherwise({
                redirectTo: "/dashboard",
                reloadOnSearch: false
            });
        }
    ]);
    function registerController(controllerType) {
        console.debug("registrando controlador: ", controllerType.$named);
        mod.controller(controllerType.$named, controllerType);
    }
    gogeo.registerController = registerController;
    function registerService(serviceType) {
        console.debug("registrando serviço: ", serviceType.$named);
        mod.service(serviceType.$named, serviceType);
    }
    gogeo.registerService = registerService;
    function registerDirective(directiveName, config) {
        console.debug("registrando diretiva: ", directiveName);
        mod.directive(directiveName, config);
    }
    gogeo.registerDirective = registerDirective;
    function registerFilter(filterName, filter) {
        console.debug("registrando filtro: ", filterName);
        mod.filter(filterName, function () { return filter; });
    }
    gogeo.registerFilter = registerFilter;
})(gogeo || (gogeo = {}));
/// <reference path="../shell.ts"/>
/**
 * Created by danfma on 05/03/15.
 */
var gogeo;
(function (gogeo) {
    var DashboardController = (function () {
        function DashboardController() {
        }
        DashboardController.$named = "DashboardController";
        return DashboardController;
    })();
    gogeo.DashboardController = DashboardController;
    gogeo.registerController(DashboardController);
})(gogeo || (gogeo = {}));
///<reference path="../shell.ts" />
/**
 * Created by danfma on 17/03/15.
 */
var gogeo;
(function (gogeo) {
    var AbstractController = (function () {
        /**
         * Construtor
         */
        function AbstractController($scope) {
            this.$scope = $scope;
            this.subscriptions = [];
        }
        /**
         * Inicializa este controlador.
         */
        AbstractController.prototype.initialize = function () {
            var _this = this;
            var selfProperty = Enumerable.from(this.$scope).where(function (x) { return x.value === _this; }).select(function (x) { return x.key; }).firstOrDefault();
            this.propertyName = selfProperty;
            this.$scope.$on("$destroy", function () { return _this.dispose(); });
        };
        AbstractController.prototype.dispose = function () {
            for (var i = 0; i < this.subscriptions.length; i++) {
                var subscription = this.subscriptions[i];
                subscription.dispose();
            }
            this.subscriptions = null;
        };
        AbstractController.prototype.evalProperty = function (path) {
            return this.$scope.$eval(this.propertyName + "." + path);
        };
        /**
         * Observa uma determinada propriedade desta instância.
         */
        AbstractController.prototype.watch = function (property, handler, objectEquality) {
            if (objectEquality === void 0) { objectEquality = false; }
            return this.$scope.$watch(this.propertyName + "." + property, handler, objectEquality);
        };
        /**
         * Observa uma determinada propriedade desta instância.
         */
        AbstractController.prototype.watchCollection = function (property, handler) {
            return this.$scope.$watchCollection(this.propertyName + "." + property, handler);
        };
        /**
         * Observer uma determinada propriedade desta instância de forma reativa.
         */
        AbstractController.prototype.watchAsObservable = function (property, isCollection, objectEquality) {
            var _this = this;
            if (isCollection === void 0) { isCollection = false; }
            if (objectEquality === void 0) { objectEquality = false; }
            return Rx.Observable.createWithDisposable(function (observer) {
                var dispose;
                if (isCollection) {
                    dispose = _this.watchCollection(property, function (value) {
                        observer.onNext(value);
                    });
                }
                else {
                    dispose = _this.watch(property, function (value) {
                        observer.onNext(value);
                    }, objectEquality);
                }
                return {
                    dispose: function () {
                        dispose();
                    }
                };
            });
        };
        AbstractController.prototype.watchObjectAsObservable = function (property) {
            return this.watchAsObservable(property, undefined, true);
        };
        AbstractController.prototype.releaseOnDestroy = function (subscription) {
            if (subscription)
                this.subscriptions.push(subscription);
        };
        return AbstractController;
    })();
    gogeo.AbstractController = AbstractController;
})(gogeo || (gogeo = {}));
/// <reference path="../shell.ts"/>
/**
 * Created by danfma on 05/03/15.
 */
var gogeo;
(function (gogeo) {
    var WelcomeController = (function () {
        function WelcomeController() {
        }
        WelcomeController.$named = "WelcomeController";
        return WelcomeController;
    })();
    gogeo.WelcomeController = WelcomeController;
    gogeo.registerController(WelcomeController);
})(gogeo || (gogeo = {}));
var gogeo;
(function (gogeo) {
    var DashboardQuery = (function () {
        function DashboardQuery($http, geomSpace) {
            this.$http = $http;
            this.requestData = {};
        }
        DashboardQuery.prototype.getMust = function () {
            return this.requestData.q.query.bool.must;
        };
        DashboardQuery.prototype.execute = function (resultHandler) {
            var url = gogeo.Configuration.makeUrl("geoagg");
            this.requestData["mapkey"] = gogeo.Configuration.getMapKey();
            return this.$http.post(url, this.requestData).success(resultHandler);
        };
        return DashboardQuery;
    })();
    gogeo.DashboardQuery = DashboardQuery;
})(gogeo || (gogeo = {}));
///<reference path="./interfaces.ts" />
var gogeo;
(function (gogeo) {
    var NeSwPoint = (function () {
        function NeSwPoint(ne, sw) {
            this.ne = ne;
            this.sw = sw;
        }
        return NeSwPoint;
    })();
    gogeo.NeSwPoint = NeSwPoint;
    var BoolQuery = (function () {
        function BoolQuery() {
            this.requestData = {
                must: []
            };
        }
        BoolQuery.prototype.addMustQuery = function (q) {
            this.requestData["must"].push(q.build()["query"]);
        };
        BoolQuery.prototype.build = function () {
            return {
                query: {
                    bool: this.requestData
                }
            };
        };
        return BoolQuery;
    })();
    gogeo.BoolQuery = BoolQuery;
    var MatchPhraseQuery = (function () {
        function MatchPhraseQuery(field, term) {
            this.query = {};
            this.query[field] = term;
        }
        MatchPhraseQuery.prototype.build = function () {
            return {
                query: {
                    match_phrase: this.query
                }
            };
        };
        return MatchPhraseQuery;
    })();
    gogeo.MatchPhraseQuery = MatchPhraseQuery;
    var SourceTermQuery = (function () {
        function SourceTermQuery(term) {
            this.term = term;
        }
        SourceTermQuery.prototype.build = function () {
            return {
                query: {
                    term: {
                        source: this.term
                    }
                }
            };
        };
        return SourceTermQuery;
    })();
    gogeo.SourceTermQuery = SourceTermQuery;
})(gogeo || (gogeo = {}));
var gogeo;
(function (gogeo) {
    var GogeoGeosearch = (function () {
        function GogeoGeosearch($http, geom, collection, buffer, buffer_measure, fields, limit, query) {
            this.$http = $http;
            this.requestData = {};
            this.geom = null;
            this.buffer = 0;
            this.buffer_measure = null;
            this.q = {};
            this.limit = 0;
            this.fields = [];
            this.collection = null;
            this.geom = geom;
            this.collection = collection;
            this.buffer = buffer;
            this.buffer_measure = buffer_measure;
            this.fields = fields;
            this.limit = limit;
            this.q = angular.toJson(query);
        }
        GogeoGeosearch.prototype.execute = function (resultHandler) {
            var url = gogeo.Configuration.makeUrl("geosearch", this.collection);
            this.requestData = {
                geom: this.geom,
                limit: this.limit,
                buffer: this.buffer,
                buffer_measure: this.buffer_measure,
                fields: this.fields,
                q: this.q,
                mapkey: gogeo.Configuration.getMapKey()
            };
            return this.$http.post(url, this.requestData).success(resultHandler);
        };
        return GogeoGeosearch;
    })();
    gogeo.GogeoGeosearch = GogeoGeosearch;
})(gogeo || (gogeo = {}));
var gogeo;
(function (gogeo) {
    var GogeoGeoagg = (function () {
        function GogeoGeoagg($http, geom, collection, field, buffer, size) {
            this.$http = $http;
            this.params = {};
            this.collection = null;
            this.collection = collection;
            if (!size) {
                size = 50;
            }
            this.params = {
                mapkey: gogeo.Configuration.getMapKey(),
                geom: geom,
                field: field,
                agg_size: size,
                buffer: buffer,
                measure_buffer: "kilometer"
            };
        }
        GogeoGeoagg.prototype.execute = function (resultHandler) {
            var url = gogeo.Configuration.makeUrl("geoagg", this.collection);
            var requestData = this.params;
            return this.$http.post(url, requestData).success(resultHandler);
        };
        return GogeoGeoagg;
    })();
    gogeo.GogeoGeoagg = GogeoGeoagg;
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-service.ts" />
var gogeo;
(function (gogeo) {
    var MetricsService = (function () {
        function MetricsService($scope, $location, service) {
            this.$scope = $scope;
            this.$location = $location;
            this.service = service;
            this._lastGeom = null;
            this._lastBucketResult = null;
            this._lastTerms = null;
            this._lastDateRange = null;
            this._lastPlace = null;
            this.firstGeom = false;
            this.firstBucket = false;
            this.firstTerms = false;
            this.firstDate = false;
            this.firstPlace = false;
            this.firstThematic = false;
            this.firstMapType = false;
            this.initialize();
        }
        MetricsService.prototype.initialize = function () {
        };
        MetricsService.$named = "metricsService";
        MetricsService.$inject = [
            "$rootScope",
            "$location",
            "dashboardService"
        ];
        return MetricsService;
    })();
    gogeo.MetricsService = MetricsService;
    gogeo.registerService(MetricsService);
})(gogeo || (gogeo = {}));
///<reference path="../../shell.ts" />
///<reference path="../../shared/controls/queries.ts"/>
///<reference path="../../shared/controls/dashboard-query.ts"/>
///<reference path="../../shared/controls/gogeo-geosearch.ts"/>
///<reference path="../../shared/controls/gogeo-geoagg.ts"/>
///<reference path="./metrics.ts"/>
/**
 * Created by danfma on 07/03/15.
 */
var gogeo;
(function (gogeo) {
    var DashboardService = (function () {
        function DashboardService($q, $http, $location, $timeout, $routeParams) {
            this.$q = $q;
            this.$http = $http;
            this.$location = $location;
            this.$timeout = $timeout;
            this.$routeParams = $routeParams;
            this._lastGeomSpace = null;
            this._loading = true;
            this._lastRadius = 0;
            this.worldBound = {
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
            this._lastQueryObservable = new Rx.BehaviorSubject(null);
            this._lastCircleObservable = new Rx.BehaviorSubject(null);
            this._lastCensusObservable = new Rx.BehaviorSubject(null);
            this._lastCrimesObservable = new Rx.BehaviorSubject(null);
        }
        Object.defineProperty(DashboardService.prototype, "loading", {
            get: function () {
                return this._loading;
            },
            enumerable: true,
            configurable: true
        });
        DashboardService.prototype.isLoading = function () {
            return this._loading;
        };
        Object.defineProperty(DashboardService.prototype, "queryObservable", {
            get: function () {
                return this._lastQueryObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "circleObservable", {
            get: function () {
                return this._lastCircleObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "censusObservable", {
            get: function () {
                return this._lastCensusObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "crimesObservable", {
            get: function () {
                return this._lastCrimesObservable;
            },
            enumerable: true,
            configurable: true
        });
        DashboardService.prototype.getRadius = function () {
            return this._lastRadius;
        };
        DashboardService.prototype.updateRadius = function (radius) {
            this._lastRadius = radius;
        };
        DashboardService.prototype.updateDashboardData = function (point) {
            this._lastCircleObservable.onNext(point);
        };
        DashboardService.prototype.crimesGeoAgg = function (geom) {
            return this.getGogeoGeoAgg(geom, gogeo.Configuration.getCrimesCollection(), gogeo.Configuration.getCrimesCategory());
        };
        DashboardService.prototype.updateCrimesAgg = function (geom) {
            var _this = this;
            var geoagg = this.crimesGeoAgg(geom);
            geoagg.execute(function (result) {
                _this._lastCrimesObservable.onNext(result);
                _this.updateCrimesDateHistogram(geom, result);
            });
        };
        DashboardService.prototype.updateCrimesDateHistogram = function (geom, result) {
            var queries = [];
            result.buckets.slice(0, 5).forEach(function (item) {
                var matchQuery = new gogeo.MatchPhraseQuery(gogeo.Configuration.getCrimesCategory(), item.key);
                queries.push(matchQuery);
            });
            var boolQuery = new gogeo.BoolQuery();
            queries.forEach(function (q) {
                boolQuery.addMustQuery(q);
            });
            // console.log("matchQuery", JSON.stringify(boolQuery.build(), null, 2));
            // console.log();
        };
        DashboardService.prototype.businessGeoAgg = function (geom) {
            return this.getGogeoGeoAgg(geom, gogeo.Configuration.getBusinessCollection(), "state");
        };
        DashboardService.prototype.getGogeoGeoAgg = function (geom, collectionName, field) {
            return new gogeo.GogeoGeoagg(this.$http, geom, collectionName, field, this._lastRadius);
        };
        DashboardService.prototype.censusGeoSearch = function (geom) {
            var fields = gogeo.Configuration.getCensusFields();
            return new gogeo.GogeoGeosearch(this.$http, geom, gogeo.Configuration.getCensusCollection(), this._lastRadius, "kilometer", fields, 10);
        };
        DashboardService.prototype.updateCensus = function (geom) {
            var _this = this;
            var ggsc = this.censusGeoSearch(geom);
            ggsc.execute(function (result) {
                _this._lastCensusObservable.onNext(result);
            });
        };
        DashboardService.prototype.calculateNeSW = function (bounds) {
            var ne = new L.LatLng(bounds.getNorthEast().lng, bounds.getNorthEast().lat);
            var sw = new L.LatLng(bounds.getSouthWest().lng, bounds.getSouthWest().lat);
            return new gogeo.NeSwPoint(ne, sw);
        };
        DashboardService.prototype.pointToGeoJson = function (point) {
            var ne = [point.ne.lat, point.ne.lng];
            var sw = [point.sw.lat, point.sw.lng];
            var nw = [sw[0], ne[1]];
            var se = [ne[0], sw[1]];
            var coordinates = [
                [
                    sw,
                    nw,
                    ne,
                    se,
                    sw
                ]
            ];
            return {
                source: "mapBounds",
                type: "Polygon",
                coordinates: coordinates
            };
        };
        DashboardService.$named = "dashboardService";
        DashboardService.$inject = [
            "$q",
            "$http",
            "$location",
            "$timeout",
            "$routeParams"
        ];
        return DashboardService;
    })();
    gogeo.DashboardService = DashboardService;
    gogeo.registerService(DashboardService);
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../../dashboard/services/dashboard-service.ts" />
/**
 * Created by danfma on 06/03/15.
 */
var gogeo;
(function (gogeo) {
    var DataRangeController = (function () {
        function DataRangeController($scope, service) {
            this.$scope = $scope;
            this.service = service;
            this.min = null;
            this.max = null;
        }
        DataRangeController.prototype.initialize = function () {
        };
        DataRangeController.$inject = [
            "$scope",
            gogeo.DashboardService.$named
        ];
        return DataRangeController;
    })();
    gogeo.registerDirective("daterange", function () {
        return {
            restrict: "E",
            template: "\n                <div class=\"input-group daterange\">\n                    <input \n                        id=\"startRange\"\n                        class=\"form-control\"\n                        type=\"text\"\n                        data-provide=\"datepicker\"\n                        data-date-clear-btn=\"true\"\n                        data-date-start-date=\"{{range.min}}\"\n                        data-date-end-date=\"{{range.max}}\"\n                        data-date-autoclose=\"true\"\n                        ng-model=\"startDate\"/>\n                    <span class=\"input-group-addon\">\n                        <i class=\"glyphicon glyphicon-calendar\"></i>\n                    </span>\n                    <input\n                        id=\"endRange\"\n                        class=\"form-control\"\n                        type=\"text\"\n                        data-provide=\"datepicker\"\n                        data-date-clear-btn=\"true\"\n                        data-date-start-date=\"{{range.min}}\"\n                        data-date-end-date=\"{{range.max}}\"\n                        data-date-autoclose=\"true\"\n                        ng-model=\"endDate\"/>\n                </div>",
            scope: {
                startDate: "=",
                endDate: "="
            },
            controller: DataRangeController,
            controllerAs: "range",
            link: function (scope, element, attrs, controller) {
                controller.initialize();
            }
        };
    });
})(gogeo || (gogeo = {}));
var gogeo;
(function (gogeo) {
    var GogeoAgg = (function () {
        function GogeoAgg($http) {
            this.$http = $http;
            this.params = {};
            this.collection = null;
        }
        return GogeoAgg;
    })();
    gogeo.GogeoAgg = GogeoAgg;
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/**
 * Created by danfma on 05/03/15.
 */
var gogeo;
(function (gogeo) {
    angular.module("gogeo").directive("welcomeMap", [
        function () {
            return {
                restrict: "C",
                // template: "<div></div>",
                link: function (scope, element, attrs) {
                    var rawElement = element[0];
                    var url = "http://api.gogeo.io/1.0/map/" + gogeo.Configuration.getDatabaseName() + "/" + gogeo.Configuration.getCollectionName() + "/{z}/{x}/{y}/tile.png?mapkey=" + gogeo.Configuration.getMapKey() + "&stylename=gogeo_many_points";
                    var initialPos = L.latLng(43.717232, -92.353034);
                    var map = L.map("welcome-map").setView(initialPos, 5);
                    map.addLayer(L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
                        attribution: 'Mapbox <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>'
                    }));
                    L.tileLayer(url).addTo(map);
                    scope.$on("destroy", function () { return map.remove(); });
                }
            };
        }
    ]);
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../../dashboard/services/dashboard-service.ts" />
var gogeo;
(function (gogeo) {
    var DashboardCensusController = (function () {
        function DashboardCensusController($scope, $window, service) {
            var _this = this;
            this.$scope = $scope;
            this.$window = $window;
            this.service = service;
            this.widthHash = {
                1280: 295,
                1366: 315,
                1920: 490
            };
            this.barChartOptions = {
                chart: {
                    type: "discreteBarChart",
                    height: 300,
                    width: this.getChartWidth(),
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 55
                    },
                    x: function (d) {
                        return d.label;
                    },
                    y: function (d) {
                        return d.value;
                    },
                    useInteractiveGuideline: true,
                    dispatch: {},
                    showXAxis: false,
                    tooltipContent: function (key, x, y, obj) {
                        y = numeral(y).format("0");
                        var content = '<h3>' + obj.point.label + '</h3>' + '<p>' + y + '</p>';
                        return content;
                    },
                    transitionDuration: 250
                }
            };
            this.incomeChartOptions = {};
            this.ageChartOptions = {};
            this.incomeChartApi = {};
            this.ageChartApi = {};
            this.pieChartApi = {};
            this.pieChartOptions = {
                chart: {
                    type: "pieChart",
                    height: this.getChartWidth(),
                    width: this.getChartWidth(),
                    x: function (d) {
                        return d.label;
                    },
                    y: function (d) {
                        return d.value;
                    },
                    showLabels: false,
                    transitionDuration: 500,
                    showLegend: true,
                    donut: true,
                    margin: {
                        top: -50,
                        left: 10,
                    },
                    tooltipContent: function (key, y, e) {
                        var tooltip = e.point.tooltip || key;
                        y = numeral(y).format("0");
                        var content = '<h3 style="background-color: ' + e.color + '">' + tooltip + '</h3>' + '<p>' + y + '</p>';
                        return content;
                    },
                    legend: {
                        // width: 400,
                        // height: 300,
                        key: function (d) {
                            return d.key;
                        },
                        margin: {
                            top: 5,
                            right: 5,
                            bottom: 25,
                            left: 5
                        }
                    }
                },
                title: {
                    enable: true,
                    text: "Races chart"
                }
            };
            this.racesData = [
                {
                    key: "white",
                    label: "White",
                    tooltip: "White",
                    value: 0
                },
                {
                    key: "black",
                    label: "Black",
                    tooltip: "Black or African American",
                    value: 0
                },
                {
                    key: "indian",
                    label: "Indian",
                    tooltip: "American Indian and Alaska Native",
                    value: 0
                },
                {
                    key: "asian",
                    label: "Asian",
                    tooltip: "Asian",
                    value: 0
                },
                {
                    key: "hawaiian",
                    label: "Hawaiian",
                    tooltip: "Native Hawaiian and Other Pacific Islander",
                    value: 0
                },
                {
                    key: "others",
                    label: "Others",
                    tooltip: "Some Other Race",
                    value: 0
                },
                {
                    key: "two_races",
                    label: "Two or More Races",
                    tooltip: "Two or More Races",
                    value: 0
                }
            ];
            this.ageData = [
                {
                    key: "Age",
                    values: [
                        {
                            label: "Under 5 years",
                            key: "age_under_5",
                            value: 0,
                            color: "#D53E4F"
                        },
                        {
                            label: "5 to 19 years",
                            key: "age_5_19",
                            value: 0,
                            color: "#FC8D59"
                        },
                        {
                            label: "20 to 29 years",
                            key: "age_20_29",
                            value: 0,
                            color: "#8C510A"
                        },
                        {
                            label: "30 to 44 years",
                            key: "age_30_44",
                            value: 0,
                            color: "#01665E"
                        },
                        {
                            label: "45 to 64 years",
                            key: "age_45_64",
                            value: 0,
                            color: "#5AB4AC"
                        },
                        {
                            label: "65 years and over",
                            key: "age_85_over",
                            value: 0,
                            color: "#3288BD"
                        }
                    ]
                }
            ];
            this.incomeData = [
                {
                    key: "Income per Household",
                    values: [
                        {
                            label: "Less than $15,000",
                            key: "household_income_less_15k",
                            value: 0,
                            color: "#053061"
                        },
                        {
                            label: "$15,000 to $34,999",
                            key: "household_income_15k_35k",
                            value: 0,
                            color: "#2166AC"
                        },
                        {
                            label: "$35,000 to $74,999",
                            key: "household_income_35k_75k",
                            value: 0,
                            color: "#4393C3"
                        },
                        {
                            label: "$75,000 to $149,999",
                            key: "household_income_75k_150k",
                            value: 0,
                            color: "#D6604D"
                        },
                        {
                            label: "$150,000 to $199,999",
                            key: "household_income_150k_200k",
                            value: 0,
                            color: "#B2182B"
                        },
                        {
                            label: "$200,000 and over",
                            key: "household_income_200k_more",
                            value: 0,
                            color: "#67001F"
                        }
                    ]
                }
            ];
            this.incomeChartOptions = _.clone(this.barChartOptions);
            this.incomeChartOptions["title"] = {
                enable: true,
                text: "Household Income Chart"
            };
            this.ageChartOptions = _.clone(this.barChartOptions);
            this.ageChartOptions["title"] = {
                enable: true,
                text: "Age Chart"
            };
            this.service.circleObservable.where(function (point) { return point != null; }).throttle(400).subscribe(function (point) {
                var geom = {
                    type: "Point",
                    coordinates: [
                        point.lng,
                        point.lat
                    ]
                };
                _this.service.updateCensus(geom);
            });
            this.service.censusObservable.where(function (result) { return result != null; }).subscribe(function (result) {
                _this.handleCensusResult(result);
            });
            var w = angular.element(this.$window);
            w.bind("resize", function () {
                var width = _this.$window.innerWidth;
                var chartWidth = _this.getChartWidth();
                _this.incomeChartOptions.chart.width = chartWidth;
                _this.ageChartOptions.chart.width = chartWidth;
                _this.pieChartOptions.chart.width = chartWidth;
                _this.pieChartOptions.chart.height = chartWidth;
                _this.incomeChartApi.refresh();
                _this.ageChartApi.refresh();
                _this.pieChartApi.refresh();
            });
        }
        DashboardCensusController.prototype.getChartWidth = function () {
            var width = this.$window.innerWidth;
            var chartWidth = this.widthHash[width];
            if (!chartWidth) {
                chartWidth = parseInt((width / 3).toFixed(0)) - 135;
            }
            return chartWidth;
        };
        DashboardCensusController.prototype.handleCensusResult = function (result) {
            this.racesData.forEach(function (race) {
                var key = race["key"];
                race["value"] = 0;
                result.forEach(function (item) {
                    race["value"] += item[key];
                });
            });
            this.ageData[0]["values"].forEach(function (age) {
                var key = age["key"];
                age["value"] = 0;
                result.forEach(function (item) {
                    age["value"] += item[key];
                });
            });
            this.incomeData[0]["values"].forEach(function (income) {
                var key = income["key"];
                income["value"] = 0;
                result.forEach(function (item) {
                    income["value"] += item[key];
                });
            });
        };
        DashboardCensusController.$inject = [
            "$scope",
            "$window",
            gogeo.DashboardService.$named
        ];
        return DashboardCensusController;
    })();
    gogeo.DashboardCensusController = DashboardCensusController;
    ;
    gogeo.registerDirective("dashboardCensus", function () {
        return {
            restrict: "E",
            templateUrl: "dashboard/controls/dashboard-census-template.html",
            controller: DashboardCensusController,
            controllerAs: "dashcensus",
            bindToController: true,
            scope: {},
            link: function (scope, element, attrs, controller) {
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../../dashboard/services/dashboard-service.ts" />
var gogeo;
(function (gogeo) {
    var DashboardCrimesController = (function () {
        function DashboardCrimesController($scope, service) {
            var _this = this;
            this.$scope = $scope;
            this.service = service;
            this.crimes = [];
            this.service.crimesObservable.where(function (result) { return result != null; }).subscribe(function (result) {
                _this.handleCrimesResult(result);
            });
        }
        DashboardCrimesController.prototype.handleCrimesResult = function (result) {
            this.crimes = result.buckets.slice(0, 5);
            // console.log("crimes", this.crimes);
        };
        DashboardCrimesController.$inject = [
            "$scope",
            gogeo.DashboardService.$named
        ];
        return DashboardCrimesController;
    })();
    gogeo.DashboardCrimesController = DashboardCrimesController;
    gogeo.registerDirective("dashboardCrimes", function () {
        return {
            restrict: "E",
            templateUrl: "dashboard/controls/dashboard-crimes-template.html",
            controller: DashboardCrimesController,
            controllerAs: "dashcrimes",
            bindToController: true,
            scope: {},
            link: function (scope, element, attrs, controller) {
            }
        };
    });
})(gogeo || (gogeo = {}));
/**
 * Created by danfma on 07/03/15.
 */
var gogeo;
(function (gogeo) {
    function prefix(eventName) {
        return "gogeo:" + eventName;
    }
    var DashboardEvent = (function () {
        function DashboardEvent() {
        }
        DashboardEvent.mapLoaded = prefix("dashboard:mapLoaded");
        return DashboardEvent;
    })();
    gogeo.DashboardEvent = DashboardEvent;
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
var gogeo;
(function (gogeo) {
    var DashboardDetailsController = (function () {
        function DashboardDetailsController($scope, $interval, $filter, service) {
            this.$scope = $scope;
            this.$interval = $interval;
            this.$filter = $filter;
            this.service = service;
        }
        DashboardDetailsController.prototype.initialize = function () {
        };
        DashboardDetailsController.$inject = [
            "$scope",
            "$interval",
            "$filter",
            gogeo.DashboardService.$named
        ];
        return DashboardDetailsController;
    })();
    gogeo.registerDirective("dashboardDetails", function () {
        return {
            restrict: "CE",
            templateUrl: "dashboard/controls/dashboard-details-template.html",
            controller: DashboardDetailsController,
            controllerAs: "details",
            bindToController: true,
            scope: true,
            link: function (scope, element, attrs, controller) {
                controller.initialize();
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../../shared/abstract-controller.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var gogeo;
(function (gogeo) {
    var DashboardController = (function (_super) {
        __extends(DashboardController, _super);
        function DashboardController($scope, service) {
            _super.call(this, $scope);
            this.service = service;
        }
        DashboardController.$inject = [
            "$scope",
            gogeo.DashboardService.$named
        ];
        return DashboardController;
    })(gogeo.AbstractController);
    gogeo.registerDirective("dashboardHeader", function () {
        return {
            restrict: "C",
            templateUrl: "dashboard/controls/dashboard-header-template.html",
            controller: DashboardController,
            controllerAs: "header",
            bindToController: true,
            scope: true
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
/// <reference path="../services/metrics.ts" />
/**
 * Created by danfma on 07/03/15.
 */
var gogeo;
(function (gogeo) {
    var DashboardMapController = (function () {
        function DashboardMapController($scope, $timeout, service, metrics) {
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.service = service;
            this.metrics = metrics;
            this.query = null;
            this.businessSelected = true;
            this.crimesSelected = false;
            this.mapTypes = ["point", "cluster", "intensity"];
            this.mapSelected = "point";
            this.baseLayers = null;
            this.layerGroup = null;
            this.circlesGroup = null;
            this.restricted = false;
            this.canOpenPopup = true;
            this.baseLayerSelected = "day";
            this.levent = null;
            this._selectedMap = new Rx.BehaviorSubject(null);
            this.layerNames = [
                gogeo.Configuration.getBusinessCollection()
            ];
            this.layerGroup = L.layerGroup([]);
            this.baseLayers = L.featureGroup([]);
        }
        DashboardMapController.prototype.initialize = function (map) {
            var _this = this;
            this.map = map;
            this.baseLayers.addLayer(this.getDayMap());
            this.map.addLayer(this.baseLayers);
            this.map.on("click", function (e) { return _this.addCircle(e); });
            this.initializeLayer();
            this.circlesGroup = new L.FeatureGroup();
            this.map.addLayer(this.circlesGroup);
            this.centerMap(37.76, -122.450);
        };
        DashboardMapController.prototype.initializeLayer = function () {
            var _this = this;
            this.map.addLayer(this.layerGroup);
            var layers = null;
            layers = this.createLayers([gogeo.Configuration.getCensusCollection()], "gogeo_default");
            for (var i in layers) {
                this.map.addLayer(layers[i]);
            }
            layers = this.createLayers(this.layerNames);
            for (var i in layers) {
                this.layerGroup.addLayer(layers[i]);
            }
            this.service.queryObservable.where(function (q) { return q != null; }).throttle(400).subscribeAndApply(this.$scope, function (query) { return _this.queryHandler(query); });
        };
        DashboardMapController.prototype.centerMap = function (lat, lng) {
            if (lat && lng) {
                var center = new L.LatLng(lat, lng);
                this.map.setView(center, 12);
            }
        };
        DashboardMapController.prototype.getNightMap = function () {
            var mapOptions = {
                // How you would like to style the map. 
                // This is where you would paste any style found on Snazzy Maps.
                styles: [
                    { "stylers": [{ "visibility": "simplified" }] },
                    { "stylers": [{ "color": "#131314" }] },
                    {
                        "featureType": "water",
                        "stylers": [{ "color": "#131313" }, { "lightness": 7 }]
                    },
                    {
                        "elementType": "labels.text.fill",
                        "stylers": [{ "visibility": "on" }, { "lightness": 25 }]
                    }
                ]
            };
            var options = {
                mapOptions: mapOptions,
                maptiks_id: "night-map"
            };
            return new L.Google("ROADMAP", options);
        };
        DashboardMapController.prototype.getDayMap = function () {
            return new L.Google('ROADMAP', { maptiks_id: "day-map" });
        };
        DashboardMapController.prototype.blockClick = function () {
            this.canOpenPopup = false;
        };
        DashboardMapController.prototype.allowClick = function () {
            this.canOpenPopup = true;
        };
        DashboardMapController.prototype.queryHandler = function (query) {
            console.log("query", JSON.stringify(query, null, 2));
            if (JSON.stringify(query) !== JSON.stringify(this.query)) {
                this.query = query;
                this.updateLayer();
            }
            else {
            }
        };
        DashboardMapController.prototype.createLayers = function (layers, stylename) {
            var _this = this;
            var array = [];
            layers.forEach(function (layerName) {
                var url = _this.configureUrl(layerName, stylename);
                var options = {
                    subdomains: gogeo.Configuration.subdomains,
                    maptiks_id: _this.mapSelected
                };
                if (["point", "intensity"].indexOf(_this.mapSelected) != (-1)) {
                    array.push(L.tileLayer(url, options));
                }
                else if (_this.mapSelected === 'cluster') {
                    array.push(_this.createClusterLayer(url));
                }
            });
            return array;
        };
        DashboardMapController.prototype.configureUrl = function (collection, stylename) {
            var database = gogeo.Configuration.getDatabaseName();
            var buffer = 8;
            var serviceName = "tile.png";
            if (this.mapSelected === "cluster") {
                serviceName = "cluster.json";
            }
            if (this.mapSelected === "intensity") {
                stylename = "gogeo_intensity";
            }
            if (collection === gogeo.Configuration.getBusinessCollection()) {
                stylename = "gogeo_many_points";
            }
            else if (collection === gogeo.Configuration.getCrimesCollection()) {
                stylename = "crimes_style";
            }
            var url = "/map/" + database + "/" + collection + "/{z}/{x}/{y}/" + serviceName + "?buffer=" + buffer + "&mapkey=123";
            if (stylename) {
                url = url + "&stylename=" + stylename;
            }
            if (this.query) {
                url = "" + url + "&q=" + encodeURIComponent(angular.toJson(this.query));
            }
            return gogeo.Configuration.prefixUrl(url);
        };
        DashboardMapController.prototype.toggleLayer = function (type) {
            if (type === "business") {
                this.addOrRemoveFromLayers(gogeo.Configuration.getBusinessCollection());
            }
            else {
                this.addOrRemoveFromLayers(gogeo.Configuration.getCrimesCollection());
            }
            this.updateLayer();
        };
        DashboardMapController.prototype.addOrRemoveFromLayers = function (layerName) {
            var index = this.layerNames.indexOf(layerName);
            if (index >= 0) {
                this.layerNames.splice(index, 1);
            }
            else {
                this.layerNames.push(layerName);
            }
        };
        DashboardMapController.prototype.switchBaseLayer = function () {
            this.baseLayers.clearLayers();
            if (this.baseLayerSelected === "day") {
                this.baseLayerSelected = "night";
                this.baseLayers.addLayer(this.getNightMap());
            }
            else {
                this.baseLayerSelected = "day";
                this.baseLayers.addLayer(this.getDayMap());
            }
            this.baseLayers.bringToBack();
        };
        DashboardMapController.prototype.hidePopup = function () {
            this.map.closePopup(this.popup);
        };
        DashboardMapController.prototype.addCircle = function (levent) {
            var _this = this;
            if (!this.canOpenPopup) {
                return;
            }
            this.circlesGroup.clearLayers();
            var point = levent.latlng;
            var radius = this.service.getRadius();
            var circleOptions = {
                color: "yellow"
            };
            var radiusInMeters = radius * 1000;
            var circle = L.circle(point, radiusInMeters, circleOptions);
            circle.on("click", function (e) { return _this.addCircle(e); });
            this.circlesGroup.addLayer(circle);
            this.service.updateDashboardData(point);
            // var polygon = LGeo.circle(point, radiusInMeters).toGeoJSON()["geometry"];
            // console.log("radius", radius);
            // console.log("polygon", JSON.stringify(polygon, null, 2));
        };
        DashboardMapController.prototype.changeMapType = function (element) {
            this.mapSelected = element.target.id;
            this._selectedMap.onNext(this.mapSelected);
            if (this.mapSelected === "intensity" && this.baseLayerSelected === "day") {
                this.switchBaseLayer();
            }
            if (this.mapSelected === "point" && this.baseLayerSelected === "night") {
                this.switchBaseLayer();
            }
            this.updateLayer();
        };
        DashboardMapController.prototype.updateLayer = function () {
            this.layerGroup.clearLayers();
            var layers = this.createLayers(this.layerNames);
            for (var i in layers) {
                this.layerGroup.addLayer(layers[i]);
            }
        };
        DashboardMapController.prototype.createClusterLayer = function (url) {
            var options = {
                subdomains: gogeo.Configuration.subdomains,
                useJsonP: false
            };
            return new L.TileCluster(url, options);
        };
        DashboardMapController.$inject = [
            "$scope",
            "$timeout",
            gogeo.DashboardService.$named,
            gogeo.MetricsService.$named
        ];
        return DashboardMapController;
    })();
    gogeo.registerDirective("dashboardMap", [
        "$timeout",
        function ($timeout) {
            return {
                restrict: "C",
                templateUrl: "dashboard/controls/dashboard-map-template.html",
                controller: DashboardMapController,
                controllerAs: "map",
                bindToController: true,
                link: function (scope, element, attrs, controller) {
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
                    $timeout(function () { return map.invalidateSize(false); }, 1);
                    scope.$on("$destroy", function () {
                        map.remove();
                    });
                }
            };
        }
    ]);
    gogeo.registerDirective("errSrc", function () {
        return {
            link: function (scope, element, attrs) {
                element.bind("error", function () {
                    if (attrs.src != attrs.errSrc) {
                        attrs.$set("src", attrs.errSrc);
                    }
                });
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
var gogeo;
(function (gogeo) {
    gogeo.registerDirective("dashboardPanel", function () {
        return {
            restrict: "C",
            link: function (scope, element, attributes) {
                function adjustSizes() {
                    var body = $(document.body);
                    var size = {
                        width: body.innerWidth(),
                        height: body.innerHeight()
                    };
                    var $top = element.find(".dashboard-top-panel");
                    var $center = element.find(".dashboard-center-panel");
                    $top.height($top.attr("data-height") + "px");
                    $center.height(size.height - $top.height());
                }
                $(window).on("resize", adjustSizes);
                adjustSizes(); // forcing the first resize
                scope.$on("destroy", function () {
                    $(window).off("resize", adjustSizes);
                });
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../../dashboard/services/dashboard-service.ts" />
var gogeo;
(function (gogeo) {
    var DashboardSummaryController = (function () {
        function DashboardSummaryController($scope, service) {
            var _this = this;
            this.$scope = $scope;
            this.service = service;
            this.crimes = [];
            this.companies = 0;
            this.crimesCount = 0;
            this.households = 0;
            this.families = 0;
            this.nonfamily = 0;
            this.householdsIncome = 0;
            this.service.circleObservable.where(function (point) { return point != null; }).throttle(400).subscribe(function (point) {
                var geom = {
                    type: "Point",
                    coordinates: [
                        point.lng,
                        point.lat
                    ]
                };
                _this.handleCompaniesResult(_this.service.businessGeoAgg(geom));
                _this.service.updateCrimesAgg(geom);
                _this.service.updateCensus(geom);
            });
            this.service.censusObservable.where(function (result) { return result != null; }).subscribe(function (result) {
                _this.handleCensusResult(result);
            });
            this.service.crimesObservable.where(function (result) { return result != null; }).subscribe(function (result) {
                _this.handleCrimesResult(result);
            });
        }
        DashboardSummaryController.prototype.handleCrimesResult = function (result) {
            this.crimesCount = result.doc_total;
            this.crimes = result.buckets.slice(0, 5);
        };
        DashboardSummaryController.prototype.handleCompaniesResult = function (geoagg) {
            var _this = this;
            geoagg.execute(function (result) {
                _this.companies = result.doc_total;
            });
        };
        DashboardSummaryController.prototype.handleCensusResult = function (result) {
            var _this = this;
            var avg = 0;
            this.households = this.families = this.nonfamily = this.householdsIncome = 0;
            result.forEach(function (item) {
                _this.households += item.households;
                _this.families += item.families;
                _this.nonfamily += item.nonfamily;
                avg += item.household_median_income;
            });
            this.householdsIncome = this.calculateWeightedAverage(result);
        };
        DashboardSummaryController.prototype.calculateWeightedAverage = function (result) {
            var pi = 0;
            var sh = 0;
            result.forEach(function (item) {
                sh += item.households;
                pi += (item.household_median_income * item.households);
            });
            return pi / sh;
        };
        DashboardSummaryController.$inject = [
            "$scope",
            gogeo.DashboardService.$named
        ];
        return DashboardSummaryController;
    })();
    gogeo.DashboardSummaryController = DashboardSummaryController;
    ;
    gogeo.registerDirective("dashboardSummary", function () {
        return {
            restrict: "E",
            templateUrl: "dashboard/controls/dashboard-summary-template.html",
            controller: DashboardSummaryController,
            controllerAs: "dashsummary",
            bindToController: true,
            scope: {},
            link: function (scope, element, attrs, controller) {
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
var gogeo;
(function (gogeo) {
    var RadiusSliderController = (function () {
        function RadiusSliderController($scope, $timeout, service) {
            var _this = this;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.service = service;
            this.radius = 0.5;
            this.radiusObservale = new Rx.BehaviorSubject(0);
            Rx.Observable.merge(this.radiusObservale).throttle(200).subscribe(function () {
                _this.service.updateRadius(_this.radius);
            });
        }
        RadiusSliderController.prototype.updateRadius = function () {
            if (this.radius != this.radiusObservale["value"]) {
                this.radiusObservale.onNext(this.radius);
            }
        };
        RadiusSliderController.$inject = [
            "$scope",
            "$timeout",
            gogeo.DashboardService.$named
        ];
        return RadiusSliderController;
    })();
    gogeo.RadiusSliderController = RadiusSliderController;
    gogeo.registerDirective("radiusSlider", function () {
        return {
            restrict: "E",
            template: "\n        <div class=\"container-fluid\">\n          <slider\n              ng-model=\"slider.radius\"\n              ng-change=\"slider.updateRadius()\"\n              floor=\"0.1\"\n              ceiling=\"5\"\n              precision=\"1\"\n              step=\"0.1\">\n          </slider>\n        </div>\n      ",
            controller: RadiusSliderController,
            controllerAs: "slider",
            bindToController: true,
            scope: {},
            link: function (scope, element, attrs, controller) {
            }
        };
    });
})(gogeo || (gogeo = {}));
