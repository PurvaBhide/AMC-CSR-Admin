// api.core.js
function ApiCore() {
  this.baseUrl = getBaseUrl();
}

ApiCore.prototype.request = function(params) {
  var url = this.baseUrl + params.path;
  var config = {
    url: url,
    method: params.method,
    data: params.data ? JSON.stringify(params.data) : undefined,
    headers: Object.assign({}, API_CONFIG.DEFAULT_HEADERS, params.headers),
    dataType: 'json'
  };

  return $.ajax(config).then(
    function(response) {
      return response;
    },
    function(error) {
      console.error('API Error [' + params.method + ' ' + params.path + ']:', error);
      throw {
        status: error.status || 500,
        message: error.responseJSON ? error.responseJSON.message : 'Network Error',
        details: error.responseJSON
      };
    }
  );
};

ApiCore.prototype.uploadFile = function(path, file, fieldName) {
  fieldName = fieldName || 'file';
  var formData = new FormData();
  formData.append(fieldName, file);
  
  var url = this.baseUrl + path;
  return $.ajax({
    url: url,
    method: 'POST',
    data: formData,
    processData: false,
    contentType: false
  });
};

var api = new ApiCore();