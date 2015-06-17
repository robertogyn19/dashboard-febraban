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
        Configuration.getTotalTweetsUrl = function () {
            return "http://maps.demos.gogeo.io/1.0/tools/totalRead";
        };
        Configuration.getPlaceUrl = function (place) {
            return "http://maps.demos.gogeo.io/1.0/tools/where/" + place;
        };
        Configuration.getStyleName = function () {
            return "";
        };
        Configuration.getCollectionName = function () {
            // return "census_sf";
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
        Configuration.getShortenUrl = function () {
            return "http://maps.demos.gogeo.io/1.0/tools/short";
        };
        Configuration.getXBackDays = function () {
            // TODO: Export this to development/deployment config file
            return 15;
        };
        Configuration.getMapKey = function () {
            // TODO: Export this to development/deployment config file
            return "123";
        };
        Configuration.getDateField = function () {
            // TODO: Export this to development/deployment config file
            return "date";
        };
        Configuration.getInterval = function () {
            // TODO: Export this to development/deployment config file
            return "day";
        };
        Configuration.getAggField = function () {
            // TODO: Export this to development/deployment config file
            return "place_type";
        };
        Configuration.getAggSize = function () {
            // TODO: Export this to development/deployment config file
            return 0;
        };
        Configuration.getPlaceFields = function () {
            // TODO: Export this to development/deployment config file
            return ["city", "state"];
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
            $routeProvider.when("/welcome", {
                controller: "WelcomeController",
                controllerAs: "welcome",
                templateUrl: "welcome/page.html",
                reloadOnSearch: false
            }).when("/dashboard", {
                controller: "DashboardController",
                controllerAs: "dashboard",
                templateUrl: "dashboard/page.html",
                reloadOnSearch: false
            }).otherwise({
                redirectTo: "/welcome",
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
            this.requestData = {
                agg_size: gogeo.Configuration.getAggSize(),
                field: gogeo.Configuration.getAggField(),
                geom: geomSpace,
                q: {
                    query: {
                        bool: {
                            must: []
                        }
                    }
                }
            };
        }
        DashboardQuery.prototype.getOrCreateAndRestriction = function (filter) {
        };
        DashboardQuery.prototype.filterBySearchTerms = function (terms) {
        };
        DashboardQuery.prototype.filterBySearchTerm = function (term) {
        };
        DashboardQuery.prototype.filterByHashtag = function (hashtag) {
        };
        DashboardQuery.prototype.filterByUsername = function (username) {
        };
        DashboardQuery.prototype.filterByText = function (text) {
        };
        DashboardQuery.prototype.filterByPlace = function (text) {
            var must = this.getMust();
            var placeQueryString = new gogeo.TextQueryBuilder(gogeo.TextQueryBuilder.Place, text);
        };
        DashboardQuery.prototype.filterByDateRange = function (range) {
            var must = this.getMust();
            var dateRangeQuery = new gogeo.DateRangeQueryBuilder(gogeo.DateRangeQueryBuilder.DateRange, range);
            must.push(dateRangeQuery.build());
        };
        DashboardQuery.prototype.getMust = function () {
            return this.requestData.q.query.bool.must;
        };
        DashboardQuery.prototype.execute = function (resultHandler) {
            var url = gogeo.Configuration.makeUrl("geoagg");
            this.requestData["mapkey"] = gogeo.Configuration.getMapKey();
            // console.log("this.requestData", JSON.stringify(this.requestData, null, 2));
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
    var TextQueryBuilder = (function () {
        function TextQueryBuilder(fields, term) {
            this.fields = fields;
            this.term = term;
        }
        TextQueryBuilder.prototype.build = function () {
            return {
                query: {
                    query_string: {
                        query: this.term,
                        fields: this.fields
                    }
                }
            };
        };
        TextQueryBuilder.HashtagText = ["entities.hashtags.text"];
        TextQueryBuilder.UserScreenName = ["user.screen_name"];
        TextQueryBuilder.Text = ["text"];
        TextQueryBuilder.Place = gogeo.Configuration.getPlaceFields();
        return TextQueryBuilder;
    })();
    gogeo.TextQueryBuilder = TextQueryBuilder;
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
    var ThematicQuery = (function () {
        function ThematicQuery(queries, prevQuery) {
            this.queries = queries;
            this.prevQuery = prevQuery;
        }
        ThematicQuery.prototype.build = function () {
            var query = {
                query: {
                    filtered: {
                        filter: {
                            or: {}
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
                }
                else if (stq["query"]["filtered"]["filter"]["or"]["filters"]) {
                    var subFilters = stq["query"]["filtered"]["filter"]["or"]["filters"];
                    for (var k in subFilters) {
                        filters.push(subFilters[k]);
                    }
                }
            }
            query["query"]["filtered"]["filter"]["or"]["filters"] = filters;
            return query;
        };
        return ThematicQuery;
    })();
    gogeo.ThematicQuery = ThematicQuery;
    var DateRangeQueryBuilder = (function () {
        function DateRangeQueryBuilder(field, range) {
            this.field = field;
            this.range = range;
        }
        DateRangeQueryBuilder.prototype.build = function () {
            var query = {
                range: {}
            };
            var fieldRestriction = query.range[this.field] = {};
            var range = this.range;
            if (range.start) {
                fieldRestriction["gte"] = this.format(range.start);
            }
            if (range.end) {
                fieldRestriction["lte"] = this.format(range.end);
            }
            return query;
        };
        DateRangeQueryBuilder.prototype.format = function (date) {
            return moment(date).format("YYYY-MM-DD");
        };
        DateRangeQueryBuilder.DateRange = gogeo.Configuration.getDateField();
        return DateRangeQueryBuilder;
    })();
    gogeo.DateRangeQueryBuilder = DateRangeQueryBuilder;
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
            this._lastHashtagFilter = null;
            this._lastSomethingTerms = [];
            this._lastPlaceString = null;
            this._lastDateRange = null;
            this._lastMapCenter = null;
            this._lastMapZoom = 0;
            this._lastMapType = null;
            this._lastMapBase = null;
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
            this._geomSpaceObservable = new Rx.BehaviorSubject(null);
            this._dateRangeObservable = new Rx.BehaviorSubject(null);
            this._lastQueryObservable = new Rx.BehaviorSubject(null);
            // _tweetObservable = new Rx.BehaviorSubject<Array<ITweet>>(null);
            this._lastCircleObservable = new Rx.BehaviorSubject(null);
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
        Object.defineProperty(DashboardService.prototype, "geomSpaceObservable", {
            get: function () {
                return this._geomSpaceObservable;
            },
            enumerable: true,
            configurable: true
        });
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
        DashboardService.prototype.getRadius = function () {
            return this._lastRadius;
        };
        DashboardService.prototype.updateRadius = function (radius) {
            this._lastRadius = radius;
        };
        DashboardService.prototype.loadGeoJson = function () {
            return this.$http.get("san-francisco.geo.json");
        };
        DashboardService.prototype.updateDashboardData = function (point) {
            this._lastCircleObservable.onNext(point);
        };
        DashboardService.prototype.crimesGeoAgg = function (geom) {
            return this.getGogeoGeoAgg(geom, gogeo.Configuration.getCrimesCollection(), "category");
        };
        DashboardService.prototype.businessGeoAgg = function (geom) {
            return this.getGogeoGeoAgg(geom, gogeo.Configuration.getBusinessCollection(), "state");
        };
        DashboardService.prototype.getGogeoGeoAgg = function (geom, collectionName, field) {
            return new gogeo.GogeoGeoagg(this.$http, geom, collectionName, field, this._lastRadius);
        };
        DashboardService.prototype.censusGeoSearch = function (geom) {
            var fields = [
                "geo_id",
                "geo_id2",
                "families",
                "nonfamily",
                "households",
                "household_median_income"
            ];
            return new gogeo.GogeoGeosearch(this.$http, geom, gogeo.Configuration.getCensusCollection(), this._lastRadius, "kilometer", fields, 10);
        };
        DashboardService.prototype.updateGeomSpace = function (geom) {
            this._loading = true;
            this._lastGeomSpace = geom;
            this._geomSpaceObservable.onNext(geom);
        };
        DashboardService.prototype.updateGeomSpaceByBounds = function (bounds) {
            var point = this.calculateNeSW(bounds);
            var geomSpace = this.pointToGeoJson(point);
            if (geomSpace) {
                this.updateGeomSpace(geomSpace);
            }
        };
        DashboardService.prototype.getTweet = function (latlng, zoom, thematicQuery) {
            return this.getTweetData(latlng, zoom, thematicQuery);
        };
        DashboardService.prototype.getDateHistogramAggregation = function () {
            // var url = Configuration.makeUrl("aggregations", Configuration.getCollectionName(), "date_histogram");
            // var q = this.composeQuery().requestData.q;
            // var options = {
            //   params: {
            //     mapkey: Configuration.getMapKey(),
            //     field: Configuration.getDateField(),
            //     interval: Configuration.getInterval(),
            //     date_format: "YYYY-MM-DD",
            //     q: JSON.stringify(q)
            //   }
            // };
            // return this.$http.get<Array<IDateHistogram>>(url, options);
        };
        DashboardService.prototype.getTweetData = function (latlng, zoom, thematicQuery) {
        };
        DashboardService.prototype.totalTweets = function () {
            var url = gogeo.Configuration.getTotalTweetsUrl();
            return this.$http.get(url);
        };
        DashboardService.prototype.search = function () {
            if (!this._lastGeomSpace) {
                return;
            }
            this._loading = true;
            // var query = this.composeQuery();
            // this._lastQueryObservable.onNext(query.requestData.q);
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
    var DashboardClickController = (function () {
        function DashboardClickController($scope, $timeout, service) {
            var _this = this;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.service = service;
            this.crimes = [
            ];
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
                _this.handleCrimesResult(_this.service.crimesGeoAgg(geom));
                _this.handleCompaniesResult(_this.service.businessGeoAgg(geom));
                _this.handleCensusResult(_this.service.censusGeoSearch(geom));
            });
        }
        DashboardClickController.prototype.handleCrimesResult = function (geoagg) {
            var _this = this;
            geoagg.execute(function (result) {
                _this.crimesCount = result.doc_total;
                _this.crimes = result.buckets.slice(0, 5);
            });
        };
        DashboardClickController.prototype.handleCompaniesResult = function (geoagg) {
            var _this = this;
            geoagg.execute(function (result) {
                _this.companies = result.doc_total;
            });
        };
        DashboardClickController.prototype.handleCensusResult = function (geosearch) {
            var _this = this;
            geosearch.execute(function (result) {
                var avg = 0;
                _this.households = _this.families = _this.nonfamily = _this.householdsIncome = 0;
                result.forEach(function (item) {
                    _this.households += item.households;
                    _this.families += item.families;
                    _this.nonfamily += item.nonfamily;
                    avg += item.household_median_income;
                });
                _this.householdsIncome = _this.calculateWeightedAverage(result);
            });
        };
        DashboardClickController.prototype.calculateWeightedAverage = function (result) {
            var pi = 0;
            var sh = 0;
            result.forEach(function (item) {
                sh += item.households;
                pi += (item.household_median_income * item.households);
            });
            return pi / sh;
        };
        DashboardClickController.$inject = [
            "$scope",
            "$timeout",
            gogeo.DashboardService.$named
        ];
        return DashboardClickController;
    })();
    gogeo.DashboardClickController = DashboardClickController;
    ;
    gogeo.registerDirective("dashboardClick", function () {
        return {
            restrict: "E",
            templateUrl: "dashboard/controls/dashboard-click-template.html",
            controller: DashboardClickController,
            controllerAs: "dashclick",
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
        DashboardDetailsController.prototype.unselect = function () {
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
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
/**
 * Created by danfma on 06/03/15.
 */
var gogeo;
(function (gogeo) {
    var DashboardHashtagsController = (function () {
        function DashboardHashtagsController($scope, service) {
            this.$scope = $scope;
            this.service = service;
            this.buckets = [];
            this.selectedHashtag = null;
            this.message = null;
            this.message = "Top 10 hashtags";
        }
        DashboardHashtagsController.prototype.hasSelected = function () {
            return this.selectedHashtag != null;
        };
        DashboardHashtagsController.prototype.selectHashtag = function (bucket) {
            this.message = "Top 5 places for this hashtag";
            this.selectedHashtag = bucket;
        };
        DashboardHashtagsController.$inject = [
            "$scope",
            gogeo.DashboardService.$named
        ];
        return DashboardHashtagsController;
    })();
    gogeo.DashboardHashtagsController = DashboardHashtagsController;
    gogeo.registerDirective("dashboardHashtags", function () {
        return {
            restrict: "E",
            templateUrl: "dashboard/controls/dashboard-hashtags-template.html",
            controller: DashboardHashtagsController,
            controllerAs: "hashtags",
            bindToController: true,
            scope: {
                buckets: "=",
                selectedHashtag: "="
            },
            link: function (scope, element, attrs, controller) {
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
            this.query = { query: { filtered: { filter: {} } } };
            this.selected = "inactive";
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
            this.layerGroup = L.layerGroup([]);
            this.baseLayers = L.featureGroup([]);
        }
        DashboardMapController.prototype.initialize = function (map) {
            var _this = this;
            this.map = map;
            this.baseLayers.addLayer(this.getDayMap());
            this.map.addLayer(this.baseLayers);
            this.map.on("moveend", function (e) { return _this.onMapLoaded(); });
            this.map.on("click", function (e) { return _this.addCircle(e); });
            this.initializeLayer();
            this.circlesGroup = new L.FeatureGroup();
            this.map.addLayer(this.circlesGroup);
            this.centerMap(37.76, -122.450);
        };
        DashboardMapController.prototype.initializeLayer = function () {
            var _this = this;
            this.map.addLayer(this.layerGroup);
            layers = this.createLayers([gogeo.Configuration.getCensusCollection()], "gogeo_default");
            for (var i in layers) {
                this.map.addLayer(layers[i]);
            }
            var layers = this.createLayers();
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
            if (JSON.stringify(query) !== JSON.stringify(this.query)) {
                this.query = query;
                this.updateLayer();
            }
            else {
            }
        };
        DashboardMapController.prototype.createLayers = function (layers, stylename) {
            var _this = this;
            if (!layers) {
                layers = [
                    gogeo.Configuration.getBusinessCollection()
                ];
            }
            if (!stylename) {
                stylename = "gogeo_many_points";
            }
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
            var url = "/map/" + database + "/" + collection + "/{z}/{x}/{y}/" + serviceName + "?buffer=" + buffer + "&mapkey=123";
            if (stylename) {
                url = url + "&stylename=" + stylename;
            }
            if (this.query) {
                url = "" + url + "&q=" + encodeURIComponent(angular.toJson(this.query));
            }
            return gogeo.Configuration.prefixUrl(url);
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
        DashboardMapController.prototype.onMapLoaded = function () {
            this.service.updateGeomSpaceByBounds(this.map.getBounds());
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
                color: "red"
            };
            var circle = L.circle(point, radius * 1000, circleOptions);
            circle.on("click", function (e) { return _this.addCircle(e); });
            this.circlesGroup.addLayer(circle);
            this.service.updateDashboardData(point);
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
            var layers = this.createLayers();
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
/// <reference path="../../shell.ts" />
var gogeo;
(function (gogeo) {
    var DateHistogramChartController = (function () {
        function DateHistogramChartController($scope, $timeout, service) {
            var _this = this;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.service = service;
            this.SIMPLE_DATE_PATTERN = "YYYY-MM-dd";
            // buckets: Array<IDateHistogram> = [];
            this.buckets = [];
            this.options = {
                chart: {
                    type: 'historicalBarChart',
                    height: 380,
                    width: 430,
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 55
                    },
                    showValues: true,
                    transitionDuration: 500,
                    xAxis: {
                        axisLabel: "Time",
                        tickFormat: function (d) {
                            return moment(new Date(d)).format("DD/MM/YYYY");
                        },
                        showMaxMin: true,
                        rotateLabels: 50
                    },
                    yAxis: {
                        axisLabel: "Count (k)",
                        tickFormat: function (d) {
                            return (d / 1000).toFixed(2);
                        },
                        axisLabelDistance: 30
                    },
                    bars: {
                        padData: true,
                        clipEdge: false
                    }
                }
            };
            this.service.queryObservable.where(function (q) { return q != null; }).throttle(400).subscribeAndApply(this.$scope, function (query) { return _this.getDataChart(); });
            this.buckets = [
                {
                    key: "Quantity",
                    bar: true,
                    values: []
                }
            ];
        }
        DateHistogramChartController.prototype.getDataChart = function () {
            // this.service.getDateHistogramAggregation().success((result: Array<IDateHistogram>) => {
            //   var values = [];
            //   this.buckets["values"] = [];
            //   result.forEach((item) => {
            //     values.push({
            //       x: item['timestamp'] + (3 * 3600 * 1000), // Add time offset +3 hours
            //       y: item['count']
            //     });
            //   });
            //   this.buckets[0]["values"] = values;
            // });
        };
        DateHistogramChartController.$inject = [
            "$scope",
            "$timeout",
            gogeo.DashboardService.$named
        ];
        return DateHistogramChartController;
    })();
    gogeo.DateHistogramChartController = DateHistogramChartController;
    gogeo.registerDirective("dateHistogramChart", function () {
        return {
            restrict: "E",
            templateUrl: "dashboard/controls/date-histogram-chart-template.html",
            controller: DateHistogramChartController,
            controllerAs: "datehisto",
            bindToController: true,
            scope: {
                buckets: "="
            },
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
