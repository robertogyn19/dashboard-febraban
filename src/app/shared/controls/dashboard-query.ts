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
              must: []
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
      var must = this.getMust();
      var placeQueryString = new TextQueryBuilder(TextQueryBuilder.Place, text);
    }

    filterByDateRange(range: IDateRange) {
      var must = this.getMust();

      var dateRangeQuery = new DateRangeQueryBuilder(DateRangeQueryBuilder.DateRange, range);
      must.push(dateRangeQuery.build());
    }

    getMust() {
      return this.requestData.q.query.bool.must;
    }

    execute(resultHandler:(IGogeoGeoAgg) => void) {
      var url = Configuration.makeUrl("geoagg");

      this.requestData["mapkey"] = Configuration.getMapKey();

      // console.log("this.requestData", JSON.stringify(this.requestData, null, 2));

      return this.$http
        .post(url, this.requestData)
        .success(resultHandler);
    }
  }
}