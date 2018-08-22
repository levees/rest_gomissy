'use strict';

const mongoose = require('mongoose');
const maxmind = require('maxmind');
const path = require('path');
const geoDb = path.resolve(__dirname, '../dbs/GeoLite2-City.mmdb');
const Schema = mongoose.Schema;

const PostalSchema = new Schema({
  country_code: String, 
  zipcode: String, 
  city: String, 
  state: String, 
  state_code: String, 
  county: String, 
  county_code: String, 
  latitude: String, 
  longitude: String, 
  accuracy: Number 
});


PostalSchema.methods = {
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

  getLocation_IP: function(ipaddress) {
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
  },

  getLocation_postal: function(zipcode) {
    console.log(postal);
    postal.findOne({'zipcode': zipcode}).exec(function (err, obj) {
      console.log(err);
      console.log(obj);
      return obj;
    });
  }
};

mongoose.model('Geo', PostalSchema);
