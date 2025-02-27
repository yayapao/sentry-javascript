// Vendored directly from https://github.com/vuejs/vue/blob/master/src/core/util/debug.js with types only changes.
var classifyRE = /(?:^|[-_])(\w)/g;
var classify = function (str) { return str.replace(classifyRE, function (c) { return c.toUpperCase(); }).replace(/[-_]/g, ''); };
var ROOT_COMPONENT_NAME = '<Root>';
var ANONYMOUS_COMPONENT_NAME = '<Anonymous>';
var repeat = function (str, n) {
    var res = '';
    while (n) {
        if (n % 2 === 1) {
            res += str;
        }
        if (n > 1) {
            str += str; // eslint-disable-line no-param-reassign
        }
        n >>= 1; // eslint-disable-line no-bitwise, no-param-reassign
    }
    return res;
};
export var formatComponentName = function (vm, includeFile) {
    if (!vm) {
        return ANONYMOUS_COMPONENT_NAME;
    }
    if (vm.$root === vm) {
        return ROOT_COMPONENT_NAME;
    }
    var options = vm.$options;
    var name = options.name || options._componentTag;
    var file = options.__file;
    if (!name && file) {
        var match = file.match(/([^/\\]+)\.vue$/);
        if (match) {
            name = match[1];
        }
    }
    return ((name ? "<" + classify(name) + ">" : ANONYMOUS_COMPONENT_NAME) + (file && includeFile !== false ? " at " + file : ""));
};
export var generateComponentTrace = function (vm) {
    var _a, _b;
    if (((_a = vm) === null || _a === void 0 ? void 0 : _a._isVue) && ((_b = vm) === null || _b === void 0 ? void 0 : _b.$parent)) {
        var tree = [];
        var currentRecursiveSequence = 0;
        while (vm) {
            if (tree.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                var last = tree[tree.length - 1];
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (last.constructor === vm.constructor) {
                    currentRecursiveSequence += 1;
                    vm = vm.$parent; // eslint-disable-line no-param-reassign
                    continue;
                }
                else if (currentRecursiveSequence > 0) {
                    tree[tree.length - 1] = [last, currentRecursiveSequence];
                    currentRecursiveSequence = 0;
                }
            }
            tree.push(vm);
            vm = vm.$parent; // eslint-disable-line no-param-reassign
        }
        var formattedTree = tree
            .map(function (vm, i) {
            return "" + ((i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) +
                (Array.isArray(vm)
                    ? formatComponentName(vm[0]) + "... (" + vm[1] + " recursive calls)"
                    : formatComponentName(vm)));
        })
            .join('\n');
        return "\n\nfound in\n\n" + formattedTree;
    }
    return "\n\n(found in " + formatComponentName(vm) + ")";
};
//# sourceMappingURL=components.js.map