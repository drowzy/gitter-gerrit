'use strict';

var request = require('request'),
    _ = require('lodash'),
    mdify   = require('./mdify');


function Gitterchannel (options) {
  var userGroups  = _.partition(options.users, function (user) {
    return _.contains(user, '!');
  });

  this.blackListedUsers = userGroups[0];
  this.users            = userGroups[1];
  this.projects         = options.projects;
  this.url              = options.url;
}

var channel = Gitterchannel.prototype;

channel.filter = function (data) {

  if (data.type === 'ref-updated') {
    return false;
  }

  var author           = (data.author && data.author.name) || (data.uploader && data.uploader.name) || '',
      project          = data.change.project,
      isValidProject   = _.contains(this.projects, project),
      isBlackListed    = _.contains(this.blackListedUsers, '!' + author.toLowerCase()),
      isValidUser      = !this.users.length ? true : _.contains(this.users, author);

  if (!isValidProject || isBlackListed || !isValidUser) {
    return false;
  }

  return true;
};

channel.send = function (data) {
  var message;

  if(!this.filter(data)) {
    return;
  }

  message = mdify(data);

  if (!message) {
    return;
  }

  return request.post(this.url).form({ message: message });
};

exports = module.exports = Gitterchannel;
