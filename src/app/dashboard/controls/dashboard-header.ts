/// <reference path="../../shell.ts" />
/// <reference path="../../shared/abstract-controller.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />

module gogeo {

  class DashboardController extends AbstractController {
    static $inject = [
      "$scope",
      DashboardService.$named
    ];

    somethingTerm: string;
    place: string;
    startDate: string = Configuration.getStartDate();
    endDate: string = Configuration.getEndDate();
    dateFormat: string = "MM/DD/YYYY";
    citiesToSearch: Array<any> = Configuration.getPlacesToSearch();
    estabOptions: Array<any> = [
      {
        value: "",
        label: "Todos estabelecimentos"
      },
      { 
        value: "Restaurantes e outros serviços de alimentação e bebidas",
        label: "Restaurantes"
      },
      { 
        value: "Comércio varejista de equipamentos de informática e comunicação; equipamentos e artigos de uso doméstico",
        label: "Informática"
      },
      { 
        value: "Comércio varejista de produtos alimentícios bebidas e fumo",
        label: "Alimentos"
      },
      { 
        value: "Comércio varejista de material de construção",
        label: "Construção"
      },
      { 
        value: "Comércio varejista de produtos farmacêuticos perfumaria e cosméticos e artigos médicos ópticos e ortopédicos",
        label: "Farmacêuticos"
      },
      { 
        value: "Comércio varejista de combustíveis para veículos automotores",
        label: "Combustíveis"
      },
      {
        value: "Hotéis e similares",
        label: "Hotéis"
      }
    ];

    constructor($scope:     ng.IScope,
          public service: DashboardService) {
      super($scope);

      this.initialize();
    }

    initialize() {
      super.initialize();

      this.watchAsObservable<string>("somethingTerm")
        .skip(1)
        .throttle(800)
        .select(term => {
          return Enumerable
            .from(term.split(" "))
            .select(part => part.trim())
            .toArray();
        })
        .subscribe(terms => this.service.updateSomethingTerms(terms));

      this.watchAsObservable<string>("place")
        .skip(1)
        .throttle(800)
        .subscribe(place => this.service.updatePlace(place));

      this.watchAsObservable<string>("typeEstab")
        .skip(1)
        .throttle(800)
        .subscribe(typeEstab => this.service.updateTypeEstab(typeEstab));

      Rx.Observable.merge(this.watchAsObservable<string>("startDate"), this.watchAsObservable<string>("endDate"))
        .skip(1)
        .throttle(400)
        .subscribe(range => {
          var startDate: Date = null;
          var endDate: Date = null;

          if (this.startDate) {
            startDate = new Date(Date.parse(this.startDate));
          }

          if (this.endDate) {
            endDate = new Date(Date.parse(this.endDate));
          }

          this.service.updateDateRange(startDate, endDate);
        });
    }
  }

  registerDirective("dashboardHeader", () => {
    return {
      restrict: "C",
      templateUrl: "dashboard/controls/dashboard-header-template.html",
      controller: DashboardController,
      controllerAs: "header",
      bindToController: true,
      scope: true
    };
  });

}