///<reference path="./_references.d.ts"/>


module gogeo {

  export var settings;
  export var placesToSearch;

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

      if (path.match(".*tile.png.*") || path.match(".*cluster.json.*")) {
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
      return "datemmdd";
    }

    static getInterval(): string {
      // TODO: Export this to development/deployment config file
      return "day";
    }

    static getAggField(): string {
      // TODO: Export this to development/deployment config file
      return "place_type"; 
    }

    static getAggChartField(): string {
      // TODO: Export this to development/deployment config file
      return "value"; 
    }

    static getSummaryGroupBy(): string {
      // TODO: Export this to development/deployment config file
      // return "sum,period"; 
      return "period"; 
    }

    static getTypeEstabGroupBy(): string {
      // TODO: Export this to development/deployment config file
      return "sum,typeestab.raw"; 
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

    static getStartDate(): string {
      // TODO: Export this to development/deployment config file
      return "05/01/2015";
    }

    static getEndDate(): string {
      // TODO: Export this to development/deployment config file
      return "05/08/2015";
    }

    static getPlacesToSearch() {
      return <any> placesToSearch;
    }

    static getReducedName(name: string): string {
      var names = {
        "Comércio varejista de produtos alimentícios, bebidas e fumo": "Alimentícios",
        "Comércio varejista de equipamentos de informática e comunicação; equipamentos e artigos de uso doméstico": "Informática",
        "Restaurantes e outros serviços de alimentação e bebidas": "Bares e Restaurantes",
        "Comércio varejista de material de construção": "Construção",
        "Comércio varejista de produtos farmacêuticos, perfumaria e cosméticos e artigos médicos, ópticos e ortopédicos": "Farmacêuticos",
        "Hotéis e similares": "Hotéis",
        "Comércio varejista de combustíveis para veículos automotores": "Combustíveis"
      };

      return names[name];
    }

    static tweetFields(): Array<string> {
      // TODO: Export this to development/deployment config file
      return [
        "people",
        "address",
        "value",
        "typepay",
        "payway",
        "typeestab",
        "flag",
        "nameestab",
        Configuration.getDateField(),
        "city",
        "state",
        "cnpj",
        "status"
      ];
    }
  }

  var mod = angular.module("gogeo", ["ngRoute", "ngCookies", "angularytics", "linkify", "ngGeolocation", "nvd3", "angular-capitalize-filter", "angucomplete-alt"])
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
            redirectTo: "/dashboard",
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