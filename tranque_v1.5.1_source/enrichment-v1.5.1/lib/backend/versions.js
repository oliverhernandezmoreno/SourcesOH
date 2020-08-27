const models = require("./models");

const makeVersion = (obj) => {
  if (obj.format !== "json") {
    throw new Error(`can't deserialize version in format '${obj.format}'`);
  }
  return {
    timestamp: obj.revision.date_created,
    object: JSON.parse(obj.serialized_data)[0].fields,
  };
};

const equalObjects = (obj1, obj2) => {
  if (typeof obj1 !== typeof obj2) {
    return false;
  }
  if (typeof obj1 === "object") {
    return (
      Object.entries(obj1).every(([key, value]) => equalObjects(value, obj2[key])) &&
      Object.entries(obj2).every(([key, value]) => equalObjects(value, obj1[key]))
    );
  }
  return obj1 === obj2;
};

const distinctConsecutive = (items, keyFn) =>
  items
    .map((item) => ({item, key: keyFn(item)}))
    .filter(({key}, ix, arr) => ix === 0 || !equalObjects(key, arr[ix - 1].key))
    .map(({item}) => item);

module.exports = async (model, pk, props = null) => {
  const [appLabel, ...modelNameParts] = model.tableName.split("_");
  const modelName = modelNameParts.join("_");
  const contentType = await models.ContentType.findOne({
    where: {
      app_label: appLabel,
      model: modelName,
    },
  });
  if (contentType === null) {
    return [];
  }
  const rawVersions = await models.Version.findAll({
    where: {
      object_id: `${pk}`,
      content_type_id: contentType.id,
    },
    include: [
      {
        model: models.Revision,
        required: true,
      },
    ],
    order: [[models.Revision, "date_created", "ASC"]],
  });
  const versions = rawVersions.map(makeVersion);
  return distinctConsecutive(
    versions,
    props === null
      ? (x) => ({...x.object})
      : (x) => props.reduce((acc, prop) => ({...acc, [prop]: x.object[prop]}), {})
  );
};
