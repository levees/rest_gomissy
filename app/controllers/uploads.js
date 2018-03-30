'use strict';

/**
 * Module dependencies.
 */

const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })
const { wrap: async } = require('co');
/**
 * Index
 */

exports.index = async(function* (req, res) {
  console.log(res.path)
  var file_name = req.body.files
  var storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      callback(null, file.fieldname + '-' + Date.now())
    }
  });

  var upload = multer({ storage: storage }).single(file_name)
  upload(req, res, function(err) {
    if(err)
      res.send("Error uploading file.");
    else
      res.send("File is uploaded");
    res.end();
  });

});
