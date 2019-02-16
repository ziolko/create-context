const async_hooks = require("async_hooks");

module.exports = function() {
  const contexts = new Map();

  const hook = async_hooks.createHook({
    init(asyncId, type, triggerAsyncId) {
      const parentContext = contexts.get(triggerAsyncId);

      if (parentContext) {
        contexts.set(asyncId, parentContext);
      }
    },

    destroy(asyncId) {
      contexts.delete(asyncId);
    }
  });

  hook.enable();

  return {
    runInContext(callback, context) {
      const asyncResource = new async_hooks.AsyncResource("ExecutionContext");
      contexts.set(asyncResource.asyncId(), context);
      asyncResource.runInAsyncScope(callback);
    },

    getContext() {
      return contexts.get(async_hooks.executionAsyncId());
    }
  };
};

