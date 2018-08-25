const mongoose = require('mongoose');
const maxmind = require('maxmind');
const path = require('path');
const geoDb = path.resolve(__dirname, '../dbs/GeoLite2-City.mmdb');

const postal = mongoose.model('Postal', { postal: String, city: String, state: String, state_code: String, county: String, county_code: String, latitude: String, longitude: String, accuracy: Number });

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
    return postal.findOne({'postal': zipcode}).exec(function (err, obj) {
      console.log(obj);
      return {
        city: obj.city,
        state: obj.state_code,
        country: obj.country,
        country_code: obj.country_code,
        postal: obj.postal,
        location: {
          latitude: obj.latitude,
          longitude: obj.longitude,
          accuracy: obj.accuracy,
          timezone: null
        }
      };
    });
  },


  /**
   * body with image tag from summernode data
   */

  bodyWithImgs: function(htmlText, board, pathToSaveImg = 'public/uploads', baseUrl = '', append = true) {
    var htmlWithImgUrls  = htmlText.replace(/src=\"data:([^\"]+)\"/gi,function(matches){
      var splitted =  (matches).split(';');
      var contentType = splitted[0];
      var encContent = splitted[1];
      var imgBase64 = encContent.substr(6);
      if (encContent.substr(0,6) != 'base64') {
        return matches;
      }
      // var imgFilename = imgBase64.substr(1,8).replace(/[^\w\s]/gi, '') + Date.now() + String(Math.random() * (900000000)).replace('.',''); // Generate a unique filename
      var imgFilename = board.toLowerCase() + moment().format('YYYYMMDD') + String(Math.random() * (900000000)).replace('.','');
      var imgExt = '';
      switch(contentType.split(':')[1]) {
        case 'image/jpeg': imgExt = 'jpg'; break;
        case 'image/gif': imgExt = 'gif'; break;
        case 'image/png': imgExt = 'png'; break;
        default: return matches;
      }
      if (!fs.existsSync(pathToSaveImg)){
        fs.mkdirSync(pathToSaveImg);
      }
      var imgPath = path.join(path.join(process.cwd(), pathToSaveImg), imgFilename + '.' + imgExt);
      var base64Data = encContent.replace(/^base64,/, "");
      fs.writeFile(imgPath, base64Data, 'base64', function(err) {
        console.log(err); // Something went wrong trying to save Image
      });

      if(baseUrl){
        var formattedBaseUrl = (((baseUrl[baseUrl.len - 1]) == '/')? baseUrl : (baseUrl+'/'));
      }
      else{
        var formattedBaseUrl = '/';
      }
      if (append){
        return 'src="'+formattedBaseUrl+pathToSaveImg+'/'+imgFilename+'.'+imgExt+'"';
      }
      else {
        return 'src="'+formattedBaseUrl+imgFilename+'.'+imgExt+'"';
      }
    });
    return htmlWithImgUrls;
  }

};
