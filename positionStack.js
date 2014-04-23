/* globals define */
define(function () {
    "use strict";
    var stacks = {},
        currentIndex = -1;

    function getOrCreateStack(fileName) {
        var stack = stacks[fileName];

        if (!stack) {
            stacks[fileName] = stack = [];
        }
        
        return stack;
    }

    return {
        "forward": function (fileName) {
            var stack = getOrCreateStack(fileName);

            if (currentIndex < stack.length - 1) {
                currentIndex++;
                return stack[currentIndex];
            }

            return null;
        },
        "back": function (fileName) {
            var stack = getOrCreateStack(fileName);

            if (currentIndex > 0) {
                currentIndex--;
                return stack[currentIndex];
            }

            return null;
        },
        "push": function (item, fileName) {
            var stack = getOrCreateStack(fileName);

            if (currentIndex === stack.length - 1) {
                if (currentIndex === 100) {
                    stack.shift();
                    currentIndex--;
                }
                stack.push(item);
            } else {
                stack = stack.splice(0, currentIndex + 1);
                stack.push(item);
            }
            currentIndex++;
        }
    };
});