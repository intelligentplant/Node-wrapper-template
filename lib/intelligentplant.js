import axios from 'axios';

var API_URL = "http://localhost:3000/";
var BASE_URL = "https://appstore.intelligentplant.com/";
var AUTH_URL = "AuthorizationServer/OAuth/Authorize";
var TOKEN_URL = "AuthorizationServer/OAuth/Token";
var USER_INFO_URL = "https://appstore.intelligentplant.com/api/Resource/UserInfo";
var DATASOURCES_URL = "https://appstore.intelligentplant.com/gestalt/api/data/datasources";

var TAG_URL = "https://appstore.intelligentplant.com/gestalt/api/data/tags/";
var HISTORICAL_URL = "https://appstore.intelligentplant.com/gestalt/api/data/v2/history";

function IntelligentPlantApi(config) {

    if (config == null) {
        let msg = "IntelligentPlant API requires a config object as a constructor parameter.\n";
        throw new Error(msg);
    }
    this.config = config;
    this.authToken = this.getToken();
}

IntelligentPlantApi.prototype.getToken = function () {
    var data = {
        client_id: this.config.shopify_api_key,
        client_secret: this.config.shopify_shared_secret,
        code: query_params['code']
    }
};

IntelligentPlantApi.prototype.makeRequest = function (endpoint, method, callback, data = null) {
    axios({
        method: method,
        url: endpoint,
        headers: {'Authorization': 'Bearer ' + this.authToken},
        data: data
    })
        .then(function (response) {
            if (typeof callback === "function") callback(response.data)
        });
};

IntelligentPlantApi.prototype.getUserInfo = function (callback = null) {
    this.makeRequest(USER_INFO_URL, 'GET', callback);
};

IntelligentPlantApi.prototype.getDataSources = function (callback = null) {
    this.makeRequest(DATASOURCES_URL, 'GET', callback);
};

IntelligentPlantApi.prototype.getDataSource = function (dataSource, callback = null) {
    let data = {
        'pageSize': 10,
        'page': 1,
        'name': '*'
    };
    this.makeRequest(TAG_URL + dataSource, 'POST', callback, data);
};

IntelligentPlantApi.prototype.getHistoricalData = function (
    dataSource,
    dataTag,
    callback = null,
    dataFunction = 'AVG',
    StartTime = '*-7d',
    EndTime = '*',
    sampleInterval = '12h') {
    let data = {
        tags: {
            [dataSource]: [
                dataTag
            ],
        },
        dataFunction: dataFunction,
        StartTime: StartTime,
        EndTime: EndTime,
        sampleInterval: sampleInterval
    };
    this.makeRequest(HISTORICAL_URL, 'POST', callback, data);
};

module.exports = IntelligentPlantApi;