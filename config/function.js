var maxmind = require('maxmind');
var path = require('path');
var geoDb = path.resolve(__dirname, '../dbs/GeoLite2-City.mmdb');

module.exports = {
  getIPAddr: function() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
      var iface = interfaces[devName];

      for (var i = 0; i < iface.length; i++) {
        var alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
          return alias.address;
      };
    };
    return '0.0.0.0';
  },

  getLocation: function(ipaddress) {
    var cityLookup = maxmind.openSync(geoDb);
    var ret = cityLookup.get(ipaddress);
    return {
      city: ret.city.names.en,
      state: ret.subdivisions[0].iso_code,
      country: ret.country.names.en,
      country_code: ret.country.iso_code,
      postal: ret.postal.code,
      location: {
        latitude: ret.location.latitude,
        longitude: ret.location.longitude,
        accuracy: ret.location.accuracy_radius,
        timezone: ret.location.time_zone
      }
    }
  }
};
