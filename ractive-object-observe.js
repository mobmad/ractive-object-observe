(function() {
  if(typeof Object.observe === 'undefined') {
    console.error("Object.observe not supported (or enabled) in your browser! If you're using Chrome, go to chrome://flags and 'Enable Experimental JavaScript'");
  }

  var ObjectObserveWrapper = function (ractive, obj, keypath, prefix) {
    var wrapper = this;
    this.value = obj;
    this.keypath = keypath;

    Object.observe(this.value, function(changes) {
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
    });
  };

  ObjectObserveWrapper.prototype = {
    teardown: function() {
    },

    get: function () {
      return this.value;
    },

    set: function ( keypath, value ) {
      this.value[keypath] = value;
    },

    reset: function ( object ) {
      this.value = {};
    }
  }

  Ractive.adaptors.ObjectObserve = {
    filter: function ( object ) {
      return typeof object === "object" && !object._observed;
    },

    wrap: function ( ractive, object, keypath, prefix ) {
      if(ractive.modifyArrays) {
        console.error("Object.Observe incompatible with modifyArrays: true. Set to false and try again!");
        return null;
      } else {
        object._observed = true;
        return new ObjectObserveWrapper(ractive, object, keypath, prefix);
      }
    }
  };

}());
