var fp = (

    function(){
        var memothunk = function(func){
            var cache = func();
            return function(){
                return cache;
            }
        };

        var thunk = function(value){
            return function(){
                return value;
            }
        };

        var curry = function (func) {
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
        };

        var variadic = function(args){
            var func = args[0];
            var rest = Array.prototype.slice.call(args, 1);
            function f1(curryFunc, tailNum){
                if (tailNum === rest.length) {
                    return curryFunc;
                }
                return f1(curryFunc(rest[tailNum]), tailNum + 1);
            }
            return f1(curry(func), 0);
        };

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

        var Stream = function(head, tail){
            var self = this;
            self.tail = tail;
            self.head = memothunk(head);

            var cons = function(head, tail){
                return new Stream(head, tail);
            };

            self.curryFoldRight = function(defaultValue){
                return function(func){
                    if (self.head()){
                        var tl = self.tail;
                        return func(self.head(), function(){
                            return tl().curryFoldRight(defaultValue)(func);
                        });
                    } else {
                        return defaultValue();
                    }
                }
            };

            self.foldRight = function(func){
                if (self.head()){
                    var tl = self.tail;
                    return func(self.head(), function(){
                        return tl().foldRight(func);
                    });
                } else {
                    return cons(thunk(null), thunk(null));
                }
            };

            self.append = function(aTail){
                return self.curryFoldRight(aTail)(function(h, t){
                    return cons(thunk(h), t);
                })
            };

            self.flatMap = function(func){
                return self.foldRight(function(h, t){
                    return func(h).append(t);
                });
            };

            self.map = function(func){
                return self.foldRight(function(h, t){
                    return cons(thunk(func(h)), t);
                });
            };

            self.toList = function(){
                if (self.head()){
                    return [self.head()].concat(self.tail().toList());
                } else {
                    return [];
                }
            };

            self.filter = function(func){
                return self.foldRight(function(h,t){
                    if (func(h)) { return cons(thunk(h), t); }
                    else return t();
                });
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
                return curry(func);
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
            },

            /**
             * MemoThunk example
             *
             * var z = memothunk(function(){
             *     console.log("asdf");
             *     return 5;
             * });
             * 
             * @param func
             * @returns {Function}
             */
            memothunk: function(func){
                return memothunk(func);
            },

            variadic: function(/** function, restOfArgs */){
                return variadic(arguments);
            },

            /**
             * stream example (lazy)
             * stream([1,2,3,4,5])
             *              .map(function(val) {console.log("map"+val); return val + 10; })
             *              .filter(function(val) { console.log("filter"+val); return val % 2 === 0})
             *              .toList()
             * @param values
             * @returns {Stream}
             */
            stream: function(values){
                if (values.length === 0) return new Stream(thunk(null), thunk(null));
                return new Stream(thunk(values.shift()), thunk(stream(values)));
            }
        }
    }
)();
