///<reference path="./_references.d.ts"/>


module gogeo {

  export var settings;

  export class Configuration {
    static get apiUrl() {
      return <string> settings["api.url"];
    }

    static get tileUrl() {
      return <string> settings["tile.url"];
    }

    static get subdomains() {
      return <string[]> settings["subdomains"];
    }

    static makeUrl(path: string, service?: string): string {
      path = [path, Configuration.getDatabaseName(), Configuration.getCollectionName(), service].join("/");
      path = path.replaceAll("//", "/");

      return Configuration.prefixUrl(path);
    }

    static prefixUrl(path: string): string {
      var serverUrl: string = Configuration.apiUrl;

      if (path.match(".*tile.png.*") || path.match(".*cluster.json.*") || path.match(".*aggregations.*")) {
        serverUrl = Configuration.tileUrl;
      }

      if (serverUrl && !serverUrl.endsWith("/")) {
        serverUrl = serverUrl + "/";
      }

      var url = "http://" + serverUrl + (path.startsWith("/") ? path.substring(1) : path);
      return url;
    }

    static getTotalTweetsUrl(): string {
      return "http://maps.demos.gogeo.io/1.0/tools/totalRead";
    }

    static getDateRangeUrl(): string {
      return "http://maps.demos.gogeo.io/1.0/tools/daterange";
    }

    static getPlaceUrl(place: string): string {
      return "http://maps.demos.gogeo.io/1.0/tools/where/" + place;
    }

    static getCollectionName(): string {
      return <string> settings["collection"];
    }

    static getShortenUrl(): string {
      return "http://maps.demos.gogeo.io/1.0/tools/short";
    }

    static getXBackDays(): number {
      // TODO: Export this to development/deployment config file
      return 15;
    }
    static getMapKey(): string {
      // TODO: Export this to development/deployment config file
      return "123";
    }

    static getDateField(): string {
      // TODO: Export this to development/deployment config file
      return "date";
    }

    static getInterval(): string {
      // TODO: Export this to development/deployment config file
      return "day";
    }

    static getAggField(): string {
      // TODO: Export this to development/deployment config file
      return "place_type"; 
    }

    static getAggSize(): number {
      // TODO: Export this to development/deployment config file
      return 0;
    }

    static getPlaceFields(): Array<string> {
      // TODO: Export this to development/deployment config file
      return [ "city", "state" ];
    }

    static getDatabaseName(): string {
      // TODO: Export this to development/deployment config file
      return "db1";
    }

    static tweetFields(): Array<string> {
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
    }
  }

  var mod = angular.module("gogeo", ["ngRoute", "ngCookies", "angularytics", "linkify", "ngGeolocation", "nvd3", "vr.directives.slider"])
    .config([
      "$routeProvider",
      "AngularyticsProvider",
      ($routeProvider: ng.route.IRouteProvider, angularyticsProvider: angularytics.AngularyticsProvider) => {
        $routeProvider
          .when("/welcome", {
            controller: "WelcomeController",
            controllerAs: "welcome",
            templateUrl: "welcome/page.html",
            reloadOnSearch: false
          })
          .when("/dashboard", {
            controller: "DashboardController",
            controllerAs: "dashboard",
            templateUrl: "dashboard/page.html",
            reloadOnSearch: false
          })
          .otherwise({
            redirectTo: "/welcome",
            reloadOnSearch: false
          });
        if (window.location.hostname.match("gogeo.io")) {
          angularyticsProvider.setEventHandlers(["Google"]);
        } else {
          angularyticsProvider.setEventHandlers(["Console"]);
        }
      }
    ]).run(
      function(Angularytics) {
        Angularytics.init();
      }
    );

  export interface INamed {
    $named: string;
  }

  export interface INamedType extends Function, INamed {

  }

  export function registerController<T extends INamedType>(controllerType: T) {
    console.debug("registrando controlador: ", controllerType.$named);
    mod.controller(controllerType.$named, <Function> controllerType);
  }

  export function registerService<T extends INamedType>(serviceType: T) {
    console.debug("registrando serviço: ", serviceType.$named);
    mod.service(serviceType.$named, serviceType);
  }

  export function registerDirective(directiveName: string, config: any) {
    console.debug("registrando diretiva: ", directiveName);
    mod.directive(directiveName, config);
  }

  export function registerFilter(filterName: string, filter: (any) => string) {
    console.debug("registrando filtro: ", filterName);
    mod.filter(filterName, () => filter);
  }

}