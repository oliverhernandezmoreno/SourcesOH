const Ajv = require("ajv");
const crypto = require("crypto");
const detective = require("detective");
const eslint = require("eslint");
const fs = require("fs");
const pack = require("browser-pack");
const path = require("path");
const program = require("commander");
const yaml = require("js-yaml");

const pkg = require("./package.json");
const eslintConfig = require(process.env.CI ? "./.eslintrc.ci.json" : "./.eslintrc.json");

const BUILDER_COMMIT = process.env.BUILDER_COMMIT || "local";

const SOURCE_EXTENSION = process.env.SOURCE_EXTENSION || "yml";
const SOURCE_VERSION = process.env.CI_COMMIT_SHA || `local-${crypto.randomBytes(20).toString("hex")}`;

const ajv = new Ajv();

const validateTemplate = ajv.compile(require("./template-schema.json"));

/**
 * Resolves a script source from the given file and variadic 'script'
 * contents.
 * @param SOURCE_DIR <string> the root directory for the whole process
 * @param f <string> the relative path of the script file
 * (w.r.t. SOURCE_DIR)
 * @param s <string | null> the actual script content, which may be a
 * path
 * @returns <[string, string | null]> the pair of resolved path and
 * script contents
 */
const resolveScript = (SOURCE_DIR, f, s) => {
  const st = s === null ? null : s.trim();
  // if 's' is nothing valid, use it as either an implicit path or
  // simply nothing
  if (!st) {
    const fullPath = path.join(
      SOURCE_DIR,
      [f.slice(0, -1 * SOURCE_EXTENSION.length), "js"].join(""),
    );
    try {
      return [path.relative(SOURCE_DIR, fullPath), fs.readFileSync(fullPath, "utf-8")];
    } catch (_) {
      return [f, null];
    }
  }
  // if 's' has linebreaks assume it to be javascript code
  if (st.indexOf("\n") !== -1) {
    return [f, s];
  }
  // if 's' points to a file, either as an explicitly relative path
  // from dirname(f) or an implicitly relative path from SOURCE_DIR,
  // use it as a path
  const relPath = st.startsWith("./") || st.startsWith("../") ?
        path.join(path.dirname(f), st) :
        st;
  const fullPath = path.join(SOURCE_DIR, relPath);
  // let it fail with E_NOTFOUND, or other IO error when appropriate
  return [path.relative(SOURCE_DIR, fullPath), fs.readFileSync(fullPath, "utf-8")];
};

/**
 * Builds an async 'bundler' function, which assembles scripts with
 * dependencies.
 * @param SOURCE_DIR <string> the root directory for the whole process
 * @param indexName <string> the index's name (e.g. 'ef')
 * @returns <function(string, string) => string> the function which
 * 'bundles' a script given its path and contents
 */
const scriptBundler = (SOURCE_DIR, indexName) => {
  const graph = {};

  const getDependencies = (sourcePath, source) => detective(source)
        .map((dependency) => {
          try {
            return {
              dependency,
              resolved: resolveScript(
                SOURCE_DIR,
                sourcePath,
                dependency.endsWith(".js") ? dependency : `${dependency}.js`,
              )
            };
          } catch (_) {
            return null;
          }
        })
        .filter((x) => x !== null)
        .filter(({resolved: [f]}) => f !== sourcePath)
        .map(({dependency, resolved: [f, s]}) => {
          if (typeof graph[f] !== "undefined") {
            return {[dependency]: graph[f].id};
          }
          const node = {
            id: f,
            source: s,
            deps: getDependencies(f, s),
            nomap: true,
          };
          graph[f] = node;
          return {[dependency]: f};
        })
        .reduce((acc, d) => ({...acc, ...d}), {});

  const fetchAllNodes = (deps) => {
    const nodes = new Set(Object.values(deps).map((id) => graph[id]));
    let size = 0;
    while (nodes.size !== size) {
      size = nodes.size;
      for (let node of nodes) {
        for (let newNode of fetchAllNodes(node.deps)) {
          nodes.add(newNode);
        }
      }
    }
    return nodes;
  };

  return async (scriptPath, script) => {
    const deps = getDependencies(scriptPath, `async () => {\n${script}\n}`);
    let bundled;
    if (Object.keys(deps).length > 0) {
      const packer = pack({raw: true});
      const nodes = fetchAllNodes(deps);
      const chunks = [];
      packer.on('data', (chunk) => chunks.push(chunk));
      const promise = new Promise((resolve) => packer.on('end', resolve));
      nodes.forEach((node) => packer.write(node));
      packer.end({
        id: "__root__",
        source: `module.exports = async () => {\n${script}\n// eslint-disable-next-line\nreturn module.exports;\n};`,
        deps,
      });
      await promise;
      bundled = `const $bundle = ${Buffer.concat(chunks).toString("utf-8")}\nreturn await $bundle("__root__")();`;
    } else {
      bundled = [
        "return await (async (module) => {",
        script,
        "// eslint-disable-next-line",
        "return module.exports;",
        "})(typeof module === 'undefined' ? {} : module);"
      ].join("\n");
    }
    return [
      `/* Assembled at ${(new Date()).toJSON()} by index-builder@${BUILDER_COMMIT} */`,
      `/* Script version ${indexName}:${SOURCE_VERSION} */`,
      bundled,
    ].join("\n");
  };
};

module.exports.scriptBundler = scriptBundler;

/**
 * Matches a path against a reference.
 * @param path <string> a (relative) file path
 * @param ref <string> a reference, which is contained in the 'inputs'
 * section of each template file
 * @returns <bool> whether the path matches the ref
 */
const matchRef = (path, ref) => {
  const p = path.slice(0, -1 * SOURCE_EXTENSION.length - 1);
  const prefix = ref.startsWith("@") ? ref.slice(1) : ref;
  if (prefix.endsWith("/*")) {
    return prefix.slice(0, -2) === p.split("/").slice(0, -1).join("/");
  }
  return p === prefix;
};

/**
 * Given a template, produces a template canonical name.
 * @param __anon__ <template> the template
 * @returns <string> the canonical name
 */
const makeTemplateName = ({path}) => path
      .replace(/\//g, ".")
      .slice(0, -1 * SOURCE_EXTENSION.length - 1);

/**
 * Builds the index manifest.
 * @param declaredManifest <manifest> the manifest previously declared
 * for the index
 * @param indexname <string> the index's name
 * @param templates <[template]> the list of templates collected for
 * the index
 * @param tests <[string]> the list of test files found
 * @returns <manifest> an 'enriched' manifest, containing inferred
 * fields
 */
const makeManifest = (declaredManifest, indexName, templates, tests) => {
  const entrypoints = templates
        .filter(
          ({path}) => !templates
            .some(({template}) => (template.inputs || []).some((ref) => matchRef(path, ref))),
        )
        .map(makeTemplateName);
  if (entrypoints.length === 0) {
    throw new Error("index has no entrypoints");
  }
  const mixedManifest = {
    name: indexName,
    ...declaredManifest,
    version: `${indexName}:${SOURCE_VERSION}`,
    builtAt: new Date(),
    groups: Object.values(
      templates
        .map(({template}) => (template.groups || {}).items)
        .filter((groups) => groups)
        .flat()
        .reduce((acc, g) => ({...acc, [g.canonical_name]: g}), {}),
    ),
    metagroups: Object.values(
      templates
        .map(({template}) => (template.groups || {}).parents)
        .filter((groups) => groups)
        .flat()
        .reduce((acc, g) => ({...acc, [g.canonical_name]: g}), {}),
    ),
    inputs: templates
      .filter(({template: {inputs}}) => (inputs || []).length === 0)
      .map(makeTemplateName),
    entrypoints,
    parameters: templates
      .flatMap(({template}) => (template.parameters || []))
      .reduce((acc, {canonical_name, name, schema, value}) => ({
        ...acc,
        [canonical_name]: {name, schema, value}
      }), {}),
    tests,
  };
  // Validate each schema
  Object.entries(mixedManifest.parameters)
    .filter(([_, {schema}]) => typeof schema !== "undefined" && schema !== null)
    .forEach(([canonical_name, {schema, value}]) => {
      const validate = ajv.compile(schema);
      if (typeof value !== "undefined" && !validate(value)) {
        throw new Error([
          `value is not compliant with its schema in ${canonical_name}:`,
          ...validate.errors.map(({dataPath, message}) => `${dataPath}: ${message}`)
        ].join("\n"));
      }
    });

  // Detect the links between groups and metagroups from the templates
  const templatesUsing = (cname, prop) => templates
        .filter(({template: {scope}}) => typeof scope !== "undefined" && scope !== null)
        .filter(({template: {groups}}) => typeof groups !== "undefined" && groups !== null)
        .filter(({template: {groups}}) => (groups[prop] || []).some(
          ({canonical_name}) => canonical_name === cname
        ));
  const linkedTemplates = (t) => templates
        .filter(({template: {scope}}) => typeof scope !== "undefined" && scope !== null)
        .filter(({template: {groups}}) => typeof groups !== "undefined" && groups !== null)
        .filter(
          (template) => (t.template.inputs || []).some((ref) => matchRef(template.path, ref)) ||
            (template.template.inputs || []).some((ref) => matchRef(t.path, ref))
        );
  const groupsOfTemplate = ({template: {groups}}) => Array.from(new Set(
    (groups.items || groups.parents).map(({canonical_name}) => canonical_name)
  )).sort();

  const directIntersections = (cname) => templatesUsing(cname, "items")
        .filter(({template: {groups}}) => groups.operator === "and")
        .map(groupsOfTemplate)
        .filter((set) => set.length > 1);
  const indirectIntersections = (cname) => templatesUsing(cname, "items")
        .flatMap(
          (t) => linkedTemplates(t)
            .filter(({template: {groups}}) => groups.items)
            .map((t) => Array.from(new Set([...groupsOfTemplate(t), cname])).sort())
        )
        .filter((set) => set.length > 1);
  const kinOf = (cname) => Array.from(new Set(
    templatesUsing(cname, "items")
      .filter(({template: {scope}}) => scope === "group")
      .flatMap(
        (t) => linkedTemplates(t)
          .filter(({template: {scope, groups}}) => scope === "group" && groups.items)
          .map(groupsOfTemplate)
          .filter((g) => g !== cname)
          .flat()
      )
  )).sort();
  const parentIntersections = (cname) => templatesUsing(cname, "parents")
        .filter(({template: {scope}}) => scope === "group")
        .map(groupsOfTemplate)
        .filter((set) => set.length > 1);
  const parentTransitives = (cname) => templatesUsing(cname, "parents")
        .filter(({template: {scope}}) => scope === "group")
        .flatMap(
          (t) => linkedTemplates(t)
            .filter(({template: {scope, groups}}) => scope === "spread" && groups.items)
            .flatMap(groupsOfTemplate)
        );
  const parentKinOf = (cname) => templatesUsing(cname, "parents")
        .filter(({template: {scope}}) => scope === "group")
        .flatMap(
          (t) => linkedTemplates(t)
            .filter(({template: {scope, groups}}) => scope === "group" && groups.parents)
            .flatMap(groupsOfTemplate)
        )
        .filter((g) => g !== cname);

  // Build propositions from links
  mixedManifest.propositions = Array.from(new Set([
    ...mixedManifest.groups
      .flatMap(({canonical_name: cname}) => [
        // trivial, it's a group and not a metagroup
        `exists S | S belongsTo [${cname}]`,
        // direct intersections
        ...directIntersections(cname).map((gs) => "exists S | " + gs.map((g) => `(S belongsTo [${g}])`).join(" and ")),
        // indirect intersections
        ...indirectIntersections(cname).map((gs) => "exists S | " + gs.map((g) => `(S belongsTo [${g}])`).join(" and ")),
        // kin relations
        ...kinOf(cname).map((kin) => {
          const [g1, g2] = [cname, kin].sort();
          return `([${g1}] childOf [${g2}]) or ([${g2}] childOf [${g1}])`;
        }),
      ]),
    ...mixedManifest.metagroups
      .flatMap(({canonical_name: cname}) => [
        // trivial, it's a metagroup
        `exists G | G childOf [${cname}]`,
        // intersections
        ...parentIntersections(cname).map((gs) => "exists G | " + gs.map((g) => `(G childOf [${g}])`).join(" and ")),
        // transitives
        ...parentTransitives(cname).map((g) => `exists S, G | (S belongsTo [${g}]) and (G childOf [${cname}]) => S belongsTo G`),
        // kin relations between metagroups
        ...parentKinOf(cname).map((kin) => {
          const [g1, g2] = [cname, kin].sort();
          return `exists G1, G2 | (G1 childOf [${g1}]) and (G2 childOf [${g2}]) => (G1 is G2) or (G1 childOf G2) or (G2 childOf G1)`;
        }),
      ]),
  ]));
  return mixedManifest;
};

/**
 * The main procedure. It walks through the target's 'src' directory
 * and produces a 'build' directory in target which contains the built
 * index.
 * @param target <string> the path of the index directory, which
 * should contain a 'src' directory
 * @param projectName <string | null> the index's name, which defaults to 'tranque-index'
 * @returns <Promise> the job itself
 */
const main = async (target, projectName = null) => {
  const SOURCE_DIR = path.join(target, "src");
  const BUILD_DIR = path.join(target, "build");
  const indexName = projectName || process.env.CI_PROJECT_NAME || "tranque-index";
  const linter = new eslint.CLIEngine({baseConfig: eslintConfig});
  const bundler = scriptBundler(SOURCE_DIR, indexName);

  const collectFiles = (extension) => {
    const step = (root) => {
      const entries = fs.readdirSync(root)
            .map((name) => ({name, stat: fs.statSync(path.join(root, name))}))
            .map(({name, stat}) => ({name, isFile: stat.isFile(), isDirectory: stat.isDirectory()}));
      return [
        ...entries.filter((entry) => entry.isFile && entry.name.endsWith(`.${extension}`))
          .map((entry) => path.join(root, entry.name)),
        ...entries.filter((entry) => entry.isDirectory)
          .map((entry) => path.join(root, entry.name))
          .flatMap((entryName) => step(entryName)),
      ];
    };
    return step(SOURCE_DIR)
      .map((filePath) => path.relative(SOURCE_DIR, filePath));
  };

  const sourceFiles = collectFiles(SOURCE_EXTENSION);
  const testFiles = collectFiles("test.js");

  const makeBuildDirectory = (() => {
    const made = new Set(["."]);
    return (dir) => {
      if (made.has(dir)) {
        return null;
      }
      const parts = dir.split(path.sep)
            .map((_, index, pieces) => pieces.slice(0, index + 1).join(path.sep));
      parts.filter((part) => !made.has(part))
        .forEach((part) => {
          fs.mkdirSync(path.join(BUILD_DIR, part));
          made.add(part);
        });
      return null;
    };
  })();

  const compileSingle = async (sourceFile) => {
    makeBuildDirectory(path.dirname(sourceFile));
    const source = yaml.safeLoad(fs.readFileSync(path.join(SOURCE_DIR, sourceFile), "utf-8"));
    const [scriptPath, script] = resolveScript(SOURCE_DIR, sourceFile, source.script || null);

    const merged = {
      ...source,
      ...(script === null ? {} : {script: await bundler(scriptPath, script)}),
      script_version: `${indexName}:${SOURCE_VERSION}`,
    };
    if (merged.script) {
      const lintResults = linter.executeOnText(`async () => {\n${merged.script}\n}`, scriptPath);
      if (lintResults.errorCount > 0) {
        console.error(lintResults.results[0].messages);
        throw new Error(`Linting failed for file ${scriptPath}`);
      }
    }
    if (!validateTemplate(merged)) {
      throw new Error([
        `at ${sourceFile}`,
        ...validateTemplate.errors.map(({dataPath, message}) => `${dataPath}: ${message}`)
      ].join("\n"));
    }
    fs.writeFileSync(path.join(BUILD_DIR, sourceFile), yaml.safeDump(merged));
    return {
      path: sourceFile,
      template: merged,
    };
  };

  const compileTest = async (testFile) => {
    makeBuildDirectory(path.dirname(testFile));
    const testedScriptPath = testFile.slice(0, -1 * ".test.js".length) + ".js";
    const testedScript = await bundler(
      testedScriptPath,
      fs.readFileSync(path.join(SOURCE_DIR, testedScriptPath), "utf-8"),
    );
    const testScript = [
      `const script = async ({ctx, refs, series, utils}) => {\n${testedScript}\n};`,
      fs.readFileSync(path.join(SOURCE_DIR, testFile), "utf-8"),
    ].join("\n");
    fs.writeFileSync(path.join(BUILD_DIR, testFile), testScript);
    return testFile;
  };

  const templates = await Promise.all(sourceFiles.map(compileSingle));
  const tests = await Promise.all(testFiles.map(compileTest));

  templates.forEach(({template, path}) => {
    const invalid = (template.inputs || [])
          .filter((ref) => !templates.some((t) => matchRef(t.path, ref)));
    if (invalid.length > 0) {
      throw new Error(`template ${path} has unmatched inputs: ${invalid.join(", ")}`);
    }
  });

  let declaredManifest = {};
  try {
    declaredManifest = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, "manifest"), "utf-8"));
  } catch (_) {}
  const manifest = makeManifest(declaredManifest, indexName, templates, tests);
  fs.writeFileSync(path.join(BUILD_DIR, `${indexName}.manifest`), JSON.stringify(manifest, null, 2));
};

module.exports.main = main;

// Program definition

program
  .version(pkg.version, "-v, --version");

program
  .command("build <target> [projectName]")
  .description("Builds the index located at the <target> directory")
  .action(main);

program.parse(process.argv);
