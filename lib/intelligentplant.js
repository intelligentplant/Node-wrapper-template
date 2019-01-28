import axios from 'axios';

let BASE_URL = "https://appstore.intelligentplant.com/";
let AUTH_URL = "AuthorizationServer/OAuth/Authorize";
let TOKEN_URL = "AuthorizationServer/OAuth/Token";
let USER_INFO_URL = "https://appstore.intelligentplant.com/api/Resource/UserInfo";
let DATASOURCES_URL = "https://appstore.intelligentplant.com/gestalt/api/data/datasources";

let TAG_URL = "https://appstore.intelligentplant.com/gestalt/api/data/tags/";
let HISTORICAL_URL = "https://appstore.intelligentplant.com/gestalt/api/data/v2/history";

function IntelligentPlantApi(config) {
    if (config == null) {
        let msg = "IntelligentPlant API requires a config object as a constructor parameter.\n";
        throw new Error(msg);
    }

    if (!config.scope) {
        config.scope = {
            'scope':
                'UserInfo DataRead AccountDebit'
        }
    }
    this.config = config;
}

IntelligentPlantApi.prototype.set_access_token = function(token) {
    this.config.access_token = token;
};

IntelligentPlantApi.prototype.exchange_temporary_token = function(query_params, callback) {
    let data = {
            client_id: this.config.client_id,
            client_secret: this.config.client_secret,
            code: query_params['code'],
            grant_type: 'authorization_code',
            redirect_uri: this.config.redirect_uri,
            scope: this.config.scope,
            headers: {'content-type': 'application/x-www-form-urlencoded'},
        },
        self = this;

    this.makeRequest(BASE_URL + TOKEN_URL, 'POST', data, function(err, body){
        if (err) {
            // err is either already an Error or it is a JSON object with an
            // error field.
            if (err.error) return callback(new Error(err.error));
            return callback(err);
        }

        self.set_access_token(body['access_token']);
        callback(null, body);
    });
};

IntelligentPlantApi.prototype.buildAuthURL = function(){
    let auth_url = BASE_URL;
    auth_url += AUTH_URL;
    auth_url += "client_id=" + this.config.client_id;
    auth_url += "&scope=" + this.config.scope;
    auth_url += "&redirect_uri=" + this.config.redirect_uri;
    return auth_url;
};

IntelligentPlantApi.prototype.makeRequest = function (endpoint, method, callback, data = null) {
    axios({
        method: method,
        url: endpoint,
        headers: {'Authorization': 'Bearer ' + this.config.access_token},
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