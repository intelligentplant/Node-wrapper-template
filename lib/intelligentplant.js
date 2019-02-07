import qs from 'qs';

let BASE_URL = "https://appstore.intelligentplant.com/";
let AUTH_URL = "AuthorizationServer/OAuth/Authorize";
let TOKEN_URL = "AuthorizationServer/OAuth/Token";

let TAG_URL = "https://appstore.intelligentplant.com/gestalt/api/data/tags/";
let USER_INFO_URL = "https://appstore.intelligentplant.com/api/Resource/UserInfo";
let HISTORICAL_URL = "https://appstore.intelligentplant.com/gestalt/api/data/v2/history";
let DATASOURCES_URL = "https://appstore.intelligentplant.com/gestalt/api/data/datasources";

function IntelligentPlantApi(config) {
    if (config == null) {
        throw new Error("IntelligentPlant API requires a config object as a constructor parameter.\n");
    }

    if (!config.scope) config.scope = 'UserInfo DataRead AccountDebit';
    if (!config.grant_type) config.grant_type = 'authorization_code';

    this.config = config;
}

IntelligentPlantApi.prototype.set_access_token = function (token) {
    this.config.access_token = token;
};

IntelligentPlantApi.prototype.buildAuthURL = function () {
    let auth_url = BASE_URL;
    auth_url += AUTH_URL;
    auth_url += "?redirect_uri=" + encodeURIComponent(this.config.redirect_uri);
    auth_url += "&client_id=" + encodeURIComponent(this.config.client_id);
    auth_url += "&scope=" + encodeURIComponent(this.config.scope);
    auth_url += "&response_type=code";
    return auth_url;
};

IntelligentPlantApi.prototype.exchange_temporary_token = function (code, callback) {
    let data = {
            client_secret: this.config.client_secret,
            redirect_uri: this.config.redirect_uri,
            grant_type: this.config.grant_type,
            client_id: this.config.client_id,
            scope: this.config.scope,
            code: code,
        },
        self = this;

    this.makeRequest(BASE_URL + TOKEN_URL, 'POST', function (err, body) {
        if (err) {
            if (err.error) return callback(new Error(err.error));
            return callback(err);
        }

        self.set_access_token(body['access_token']);
        callback(null, body);
    }, qs.stringify(data));
};

IntelligentPlantApi.prototype.makeRequest = function (endpoint, method, callback, data = null) {
    let https = require('https');

    let options = {
        path: endpoint,
        method: method.toLowerCase(),
        headers: {
            'Authorization': 'Bearer ' + this.config.access_token,
            'Content-Type': 'application/json'
        },
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', function (d) {
            body += d;
        });
        res.on('end', function () {
            callback(JSON.parse(body));
        });
    });
    req.on('error', (e) => {
        console.error(e);
    });
    req.write(data);
    req.end();
};

IntelligentPlantApi.prototype.getUserInfo = function (callback = null) {
    this.makeRequest(USER_INFO_URL, 'GET', callback);
};

IntelligentPlantApi.prototype.getDataSources = function (callback = null) {
    this.makeRequest(DATASOURCES_URL, 'GET', callback);
};

IntelligentPlantApi.prototype.getDataSource = function (
    dataSource,
    callback = null,) {
    this.makeRequest(TAG_URL + dataSource, 'GET', callback);
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
    this.makeRequest(HISTORICAL_URL, 'POST', callback, JSON.stringify(data));
};

export default IntelligentPlantApi;