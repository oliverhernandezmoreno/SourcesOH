const {hollowDependencies} = require("./dependencies");

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

// Builds a proper step function given the body.
const buildFn = (script) => {
  return new AsyncFunction(
    "$deps",
    // Deconstruct dependencies according to their names
    `const {${Object.keys(hollowDependencies).join(", ")}} = $deps;\n${script}`
  );
};

// Resolve an eval-mode script. The script itself is contained in
// *ref.script*. The resolved function will be cached according to
// *ref.template_name* and *ref.script_version*.
const resolveEval = (() => {
  const cache = {};
  return (_, messageId, ref) => {
    const script = (ref.script || "").trim();
    if (!script) {
      return null;
    }
    // Cache if the script is cache-able
    if (ref.template_name && ref.script_version) {
      const cacheKey = `${ref.template_name}@${ref.script_version}`;
      if (!cache[cacheKey]) {
        cache[cacheKey] = buildFn(script);
      }
      return cache[cacheKey];
    }
    // Build it and don't cache it
    return buildFn(script);
  };
})();

// Resolve an import-mode script. The script itself should be found in
// a module named according to *ref.template_name* and a function
// named according to *ref.script_version*.
const resolveImport = ({log}, messageId, ref) => {
  try {
    const moduleName = ref.template_name;
    const scriptModule = module.require(`./indices/${moduleName}`);
    const fn = scriptModule[ref.script_version];
    if (!fn) {
      log.warn(
        `Script ${moduleName} doesn't have an entry for version ${ref.script_version}`,
        {messageId}
      );
      return null;
    }
    return fn;
  } catch (_) {
    return null;
  }
};

// Wrap the execution of an async procedure in a race with a timeout.
const wrapWithTimeout = (fn, timeout) => (...args) =>
  Promise.race([
    Promise.resolve(fn(...args)),
    new Promise((resolve, reject) =>
      setTimeout(reject, timeout, new Error(`timeout error: ${timeout}`))
    ),
  ]);

// Resolve a script according to the mode configured through the
// environment.
module.exports.resolveScript = (context, messageId, ref) => {
  const {conf} = context;
  const fn = (
    {
      eval: () => resolveEval(context, messageId, ref),
      import: () => resolveImport(context, messageId, ref),
    }[conf.ENGINE_EXECUTION_MODE] ||
    (() => {
      throw new Error(`invalid execution mode: ${conf.ENGINE_EXECUTION_MODE}`);
    })
  )();

  return fn === null ? null : wrapWithTimeout(fn, conf.ENGINE_EXECUTION_TIMEOUT);
};
