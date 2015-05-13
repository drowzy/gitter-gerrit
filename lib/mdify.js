'use strict';

var _  = require('lodash'),
    fs = require('fs');

var templates = {
  commentAddedTemplate:    fs.readFileSync(__dirname + '/../templates/comment.md', 'utf8'),
  patchsetCreatedTemplate: fs.readFileSync(__dirname + '/../templates/new_patchset.md', 'utf8'),
};

var types = {

  commentAdded: function (data) {
    var comment = data.comment.replace('\n', ' ');

    return {
      type: data.type,
      author: data.author.name,
      branch: data.change.branch,
      subject: data.change.subject,
      comment: comment,
      url: data.change.url
    };
  },

  patchsetCreated: function (data) {
    return {
      type: data.type,
      author: data.uploader.name,
      branch: data.change.branch,
      subject: data.change.subject,
      patchSetNumber: data.patchSet.number,
      url: data.change.url,
      status: +data.patchSet.number === 1 ? 'a NEW' : 'an UPDATED'
    };
  }
};

function message(data) {
  var fn = _.camelCase(data.type);

  if (!types.hasOwnProperty(fn)) {
    return;
  }

  return _.template(templates[fn + 'Template'])(types[fn](data));
}

exports = module.exports = message;
