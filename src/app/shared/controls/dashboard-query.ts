module gogeo {
  export class DashboardQuery {
    requestData: any = {};

    constructor(private $http: ng.IHttpService, geomSpace: IGeomSpace) {
      this.requestData = {
        agg_size: Configuration.getAggSize(),
        field: Configuration.getAggField(),
        geom: geomSpace,
        q: {
          query: {
            bool: {
              must: [
                {
                  match: {
                    fraud: {
                      query: "yes"
                    }
                  }
                }
              ]
            }
          }
        }
      };
    }

    getOrCreateAndRestriction(filter: any) {
    }

    filterBySearchTerms(terms: string[]) {
    }

    filterBySearchTerm(term: string) {
    }

    filterByHashtag(hashtag: IBucket) {
    }

    filterByUsername(username: string) {
    }

    filterByText(text: string) {
    }

    filterByPlace(text: string) {
      this.filterByField(text, "city")
    }

    filterByTypeEstab(text: string) {
      this.filterByField(text, "typeestab");
    }

    filterByField(text: string, field: string) {
      var must = this.getMust();

      var placeQueryString = new MatchPhraseQuery(text, field);
      must.push(placeQueryString.build());
    }

    filterByDateRange(range: IDateRange) {
      var must = this.getMust();

      var dateRangeQuery = new DateRangeQueryBuilder(DateRangeQueryBuilder.DateRange, range);
      must.push(dateRangeQuery.build());
    }

    getMust() {
      return this.requestData.q.query.bool.must;
    }

    execute(resultHandler:(IHashtagResult) => void) {
      var url = Configuration.makeUrl("geoagg");

      this.requestData["mapkey"] = Configuration.getMapKey();

      return this.$http
        .post(url, this.requestData)
        .success(resultHandler);
    }
  }
}