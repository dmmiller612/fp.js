var fp = (

    function(){

        var Maybe = function(value){
            var self = this;

            var nothing = function () {
                return new Maybe(null);
            };
            var just = function (newVal) {
                return new Maybe(newVal);
            };

            self.map = function (func) {
                return !value ? nothing() : just(func(value));
            };

            self.flatMap = function (func) {
                var tempMaybe = func(value);
                if (tempMaybe instanceof Maybe) return tempMaybe;
                else throw ("your function does not return a maybe");
            };

            self.get = function(){
                return !value ? nothing() : value;
            };

            self.getOrElse = function(func){
                return !value ? func() : value;
            }
        };

        return {
            /**
             * Curry Example:
             *
             * var fn = f.curry(function(a, b, c) { return [a, b, c]; });
             * console.log(fn("a", "b")("c"));
             * console.log(fn("a")("b")("c"));
             *
             * @param func
             * @returns {Function}
             */
            curry: function (func) {
                return function innerFunc() {
                    var innerArgs = Array.prototype.slice.call(arguments, 0);
                    if (innerArgs.length >= func.length) {
                        return func.apply(null, innerArgs);
                    }
                    else {
                        return function () {
                            return innerFunc.apply(null, innerArgs.concat(Array.prototype.splice.call(arguments, 0)));
                        }
                    }
                };
            },

            /**
             * Imperative Style
             *
             * comprehension Example:
             * var zah = [4,9,2,5,7];
             * var blah = f.comprehension(function(x){ return x*2}, zah, function(x){ return x % 2 == 0 });
             * console.log(blah);
             *
             * @param func
             * @param items
             * @param condition
             * @returns {Array}
             */
            comprehension: function (func, items, condition) {
                var finalItems = [];
                for (var i = 0; i < items.length; i++) {
                    if (condition(items[i])) {
                        finalItems.push(func(items[i]));
                    }
                }
                return finalItems;
            },

            /**
             * recursive comprehension Example:
             * var zah = [4,9,2,5,7];
             * var blah = f.recurComprehension(function(x){ return x*2}, zah, function(x){ return x % 2 == 0 });
             * console.log(blah);
             *
             * @param func
             * @param items
             * @param condition
             */
            recurComprehension: function (func, items, condition) {
                function innerFunc(itemNum, incomingList) {
                    if (itemNum >= items.length) {
                        return incomingList;
                    }
                    var itemList = condition(items[itemNum]) ? incomingList.concat(func(items[itemNum])) : incomingList;
                    return innerFunc(itemNum + 1, itemList);
                }
                return innerFunc(0, []);
            },

            /**
             * Maybe Example
             *
             * //flatMap (monad/comonad)
             * var value = fp.maybe("hey")
             *               .flatMap(function(x){ return fp.maybe(x + " buddy") })
             *               .get();
             *
             * //functor
             * fp.maybe("hey").map(function(x){ return x + " you"}).get()
             *
             * //else get fallback
             * fp.maybe(null).getOrElse(function(){return "asdfasdf"});
             *
             * @param value
             * @returns {Maybe}
             */
            maybe: function (value) {
                return new Maybe(value);
            }
        }
    }
)();

/**
 * Curry Function.prototype Example:
 * var blah = function(a,b,c){ return[a,b,c]; }.curry();
 * console.log(blah("a")("e")("r"));
 *
 * @returns {Function}
 */
Function.prototype.curry = function(){
    return fp.curry(this);
};
