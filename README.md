# @intelligentplant/app-store-api
Library for authenticating and calling the Intelligent Plant AppStore API.

Current support is for the unencrypted `authorization_code` grant type, so this should not be used on a client side application due to security concerns.

Begin by signing up as a developer at https://appstore.intelligentplant.com/, create a new app and retrieve your Client Secret and Client ID.

[Appstore developer resources](https://appstore.intelligentplant.com/Developer/Resources)
## Install
```
npm install -S @intelligentplant/app-store-api
```

## Configure Application

```js
import IntelligentPlantApi from '@intelligentplant/app-store-api';

let IntelligentPlantApi = new IntelligentPlantApi({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: GRANT_TYPE, (Default: 'authorization_code')
            redirect_uri: REDIRECT_URI,
            scope: SCOPE, (Default: 'UserInfo DataRead AccountDebit')
        });

```

## Usage

```js

// Building the authentication url

var auth_url = IntelligentPlantApi.buildAuthURL();

// Call the url

```
## Receiving the token with the authorization code

After the user visits the authentication url, they will be redirected to the route specified in the configuration redirect_url parameter.

```js
app.get('/finish_auth', function(req, res){

  var IntelligentPlantApi = new IntelligentPlantApi(config), // You need to pass in your config here
    query_params = req.query;

  IntelligentPlantApi.exchange_temporary_token(query_params, function(err, data){
    // This will return successful if the request was authentic from IntelligentPlant
    // Otherwise err will be non-null.
    // The module will automatically update your config with the new access token
    // It is also available here as data['access_token']
  });

});

### Setting Access Token

```js
this.IntelligentPlantApi.set_access_token(TOKEN);
```


### API Query Example

```js

this.IntelligentPlantApi.getDataSources((response) => {
            console.log(response)
        });
```

### Available Methods

- getUserInfo(callback)
- getDataSources(callback)
- getDataSource(dataSource, callback)
- getHistoricalData(dataSource, dataTag, callback) // Default average for 1 week
- getHistoricalData(dataSource, dataTag, callback, dataFunction, StartTime, EndTime, sampleInterval)



