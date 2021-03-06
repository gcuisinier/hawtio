/**
 * @module Core
 */

/// <reference path="corePlugin.ts"/>
module Core {

  // local storage service to wrap the HTML5 browser storage
  _module.service('localStorage',() => {
    return Core.getLocalStorage();
  });

  // service that's used to set the page title so it can be dynamically updated
  _module.factory('pageTitle', () => {
    var answer = new Core.PageTitle();
    return answer;
  });

  // Holds a mapping of plugins to layouts, plugins use this to specify a full width view, tree view or their own custom view
  _module.factory('viewRegistry',() => {
    return {};
  });

  // should hold the last URL that the user was on after a route change
  _module.factory('lastLocation', () => {
    return {};
  });

  // service to register stuff that should happen when the user logs in
  _module.factory('postLoginTasks', () => {
    return Core.postLoginTasks;
  });

  // service to register stuff that should happen when the user logs out
  _module.factory('preLogoutTasks', () => {
    return Core.preLogoutTasks;
  });

  // help registry for registering help topics/pages to
  _module.factory('helpRegistry', ["$rootScope", ($rootScope) => {
    return new Core.HelpRegistry($rootScope);
  }]);

  // preference registry service that plugins can register preference pages to
  _module.factory('preferencesRegistry', () => {
    return new Core.PreferencesRegistry();
  });

  // service for the javascript object that does notifications
  _module.factory('toastr', ["$window", ($window) => {
    var answer: any = $window.toastr;
    if (!answer) {
      // lets avoid any NPEs
      answer = {};
      $window.toaster = answer;
    }
    return answer;
  }]);

  // service for xml2json, should replace with angular.to/from json functions
  _module.factory('xml2json', () => {
    var jquery:any = $;
    return jquery.xml2json;
  });

  // the jolokia URL we're connected to, could probably be a constant
  _module.factory('jolokiaUrl', () => {
    return jolokiaUrl;
  });

  // holds the status returned from the last jolokia call (?)
  _module.factory('jolokiaStatus', () => {
    return {
      xhr: null
    };
  });

  // jolokia settings, probably could be a constant
  _module.factory('jolokiaParams', ["jolokiaUrl", (jolokiaUrl) => {
    return {
      url: jolokiaUrl,
      canonicalNaming: false,
      ignoreErrors: true,
      mimeType: 'application/json'
    };
  }]);

  // branding service, controls app name and logo
  _module.factory('branding', () => {
    var branding = Themes.brandings['hawtio'].setFunc({});
    branding.logoClass = () => {
        if (branding.logoOnly) {
          return "without-text";
        } else {
          return "with-text";
        }
      };
    return branding;
  });

  // user detail service, contains username/password
  _module.factory('userDetails', ["jolokiaUrl", "localStorage", (jolokiaUrl, localStorage)  => {
    var answer = angular.fromJson(localStorage[jolokiaUrl]);
    if (!angular.isDefined(answer) && jolokiaUrl) {
      answer = {
        username: '',
        password: ''
      };

      log.debug("No username set, checking if we have a session");
      // fetch the username if we've already got a session at the server
      var userUrl = jolokiaUrl.replace("jolokia", "user");
      $.ajax(userUrl, {
        type: "GET",
        success: (response) => {
          log.debug("Got user response: ", response);
          executePostLoginTasks();
          /*
          // We'll only touch these if they're not set
          if (response !== '' && response !== null) {
            answer.username = response;
            if (!('loginDetails' in answer)) {
              answer['loginDetails'] = {};
            }
          }
          */
        },
        error: (xhr, textStatus, error) => {
          log.debug("Failed to get session username: ", error);
          executePostLoginTasks();
          // silently ignore, we could be using the proxy
        }
      });
      return answer;
    } else {
      return answer;
    }

  }]);
}
