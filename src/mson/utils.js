import _ from 'lodash';
import uuid from 'uuid';

class Utils {
  async sequential(items, onItem) {
    const values = [];
    await _.reduce(
      items,
      async (promise, item, key) => {
        await promise;
        const value = await onItem(item, key);
        if (value !== undefined) {
          values.push(value);
        }
      },
      Promise.resolve()
    );
    return values;
  }

  _mergeCustomizer = (objValue, srcValue) => {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  };

  // A recursive merge that also concats arrays
  merge(object, sources) {
    return _.mergeWith(object, sources, this._mergeCustomizer);
  }

  inBrowser() {
    return !!global.window;
  }

  // Source: https://stackoverflow.com/a/40577337/2831606
  getAllMethodNames(obj) {
    let methods = new Set();
    while ((obj = Reflect.getPrototypeOf(obj))) {
      let keys = Reflect.ownKeys(obj);
      keys.forEach(k => methods.add(k));
    }
    return methods;
  }

  combineWheres(where1, where2) {
    // Clone so that we don't modify the original where
    where1 = _.cloneDeep(where1);
    where2 = _.cloneDeep(where2);

    if (where1 && where2) {
      return {
        $and: [where1, where2]
      };
    } else if (where1) {
      return where1;
    } else {
      return where2;
    }
  }

  toWhereFromSearchString(attributes, string) {
    const trimmed = string.trim();

    // Empty?
    if (trimmed === '') {
      return null;
    }

    const words = trimmed.split(/ +/);

    const ands = [];

    words.forEach(word => {
      const ors = [];
      attributes.forEach(attr => {
        ors.push({
          [attr]: {
            // We need to use iLike as like is not case sensitive with binary (like JSON) data
            $iLike: word + '%'
          }
        });
      });
      ands.push({
        $or: ors
      });
    });

    return {
      $and: ands
    };
  }

  uuid() {
    return uuid.v4();
  }

  once(emitter, evnt) {
    return new Promise(function(resolve) {
      emitter.once(evnt, function() {
        resolve(arguments);
      });
    });
  }
}

export default new Utils();
