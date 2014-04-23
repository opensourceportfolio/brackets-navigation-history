/* globals define */
define(function () {
    "use strict";
    var stack = [],
        currentIndex = -1;

    return {
        "forward": function () {
            if (currentIndex < stack.length - 1) {
                currentIndex++;
                return stack[currentIndex];
            }

            return null;
        },
        "back": function () {
            if (currentIndex > 0) {
                currentIndex--;
                return stack[currentIndex];
            }

            return null;
        },
        "push": function (item) {
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