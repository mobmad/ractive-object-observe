(function() {
  if(typeof Object.observe === 'undefined') {
    console.error("Object.observe not supported (or enabled) in your browser! If you're using Chrome, go to chrome://flags and 'Enable Experimental JavaScript'");
  }

  var ObjectObserveWrapper = function(ractive, obj, keypath, prefix) {
    this.value = obj;
    this.keypath = keypath;
    this.observeCallback = function(changes) {
      var keyPathsToUpdate = [];

      function scheduleKeyPathUpdate(keyPath) {
        if(keyPathsToUpdate.indexOf(keyPath) === -1) {
          keyPathsToUpdate.push(keyPath);
        }
      }

      changes.forEach(function(change) {
        switch (change.type) {
          case "updated":
            scheduleKeyPathUpdate(Object.keys(prefix(change.name))[0]);
            break;
          case "new":
          case "splice":
          case "deleted":
            var keyPath = Object.keys(prefix(change.name))[0];

            // Array deletions (task.list.length = 0) will trigger one change pr. element
            // in order to update ractive only once, we normalize the keyPath to represent their containing
            // array instead, e.g.:
            //    task.list.1 => task.list
            // This allows us to trigger 1 update instead of N updates
            keyPath = keyPath.replace(/\.[0-9]+$/, "");
            scheduleKeyPathUpdate(keyPath);
            break;
          default:
            console.error("Unhandled change event: " + change.type);
            break;
        }
      });

      keyPathsToUpdate.forEach(function(kp) {
        ractive.update(kp.keyPath);
      });
    };

    Object.observe(this.value, this.observeCallback);
  };

  ObjectObserveWrapper.prototype = {
    teardown: function() {
      Object.unobserve(this.value, this.observeCallback);
    },

    get: function() {
      return this.value;
    },

    set: function(keypath, value) {
      this.value[keypath] = value;
    },

    reset: function() {
      this.value = {};
    }
  };

  Ractive.adaptors.ObjectObserve = {
    filter: function(object) {
      return typeof object === "object";
    },

    wrap: function(ractive, object, keypath, prefix) {
      if(ractive.modifyArrays) {
        console.error("Object.Observe incompatible with modifyArrays: true. Set to false and try again!");
        return null;
      } else {
        return new ObjectObserveWrapper(ractive, object, keypath, prefix);
      }
    }
  };

}());
