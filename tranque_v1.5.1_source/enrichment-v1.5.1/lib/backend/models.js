const crypto = require("crypto");
const Sequelize = require("sequelize");
const uuidv5 = require("uuid/v5");

const conf = require("../conf");
const log = require("../log");

const sequelize = new Sequelize({
  dialect: "postgres",
  database: conf.DATABASE_NAME,
  username: conf.DATABASE_USER,
  password: conf.DATABASE_PASSWORD,
  host: conf.DATABASE_HOST,
  port: conf.DATABASE_PORT,
  logging: (msg) => log.debug(msg),
  operatorsAliases: false,
  define: {
    timestamps: false,
    freezeTableName: true,
    underscored: false,
  },
});

exports.sequelize = sequelize;

const generateId = () => {
  const namespaceUUID = uuidv5(conf.NAMESPACE, uuidv5.DNS);
  const secret = crypto
    .randomBytes(32)
    .toString("base64")
    .replace(/\//g, "_")
    .replace(/\+/g, "-");
  const id = uuidv5(secret, namespaceUUID, Buffer.alloc(16));
  return id.toString("base64").replace(/\//g, "_").replace(/\+/g, "-").slice(0, 22);
};

exports.generateId = generateId;

const ContentType = sequelize.define(
  "content_type",
  {
    id: {type: Sequelize.INTEGER, primaryKey: true},
    app_label: {type: Sequelize.STRING(100), allowNull: false},
    model: {type: Sequelize.STRING(100), allowNull: false},
  },
  {
    tableName: "django_content_type",
  }
);

exports.ContentType = ContentType;

const Revision = sequelize.define(
  "revision",
  {
    id: {type: Sequelize.INTEGER, primaryKey: true},
    date_created: {type: Sequelize.DATE, allowNull: false},
  },
  {
    tableName: "reversion_revision",
  }
);

exports.Revision = Revision;

const Version = sequelize.define(
  "version",
  {
    id: {type: Sequelize.INTEGER, primaryKey: true},
    object_id: {type: Sequelize.STRING(191), allowNull: false},
    format: {type: Sequelize.STRING(255), allowNull: false},
    serialized_data: {type: Sequelize.TEXT, allowNull: false},
    content_type_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: ContentType,
        key: "id",
      },
    },
    revision_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: Revision,
        key: "id",
      },
    },
  },
  {
    tableName: "reversion_version",
  }
);

exports.Version = Version;

const Target = sequelize.define(
  "target",
  {
    id: {type: Sequelize.STRING(22), primaryKey: true, defaultValue: generateId},
    name: {type: Sequelize.STRING(510), allowNull: false},
    canonical_name: {type: Sequelize.STRING(510), allowNull: false},
    can_emit_alerts: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
    meta: {type: Sequelize.JSONB},
    coords: {type: Sequelize.JSONB},
    geometry: {type: Sequelize.GEOMETRY("POINT", 4326)},
    perimeter: {type: Sequelize.GEOMETRY("MULTIPOLYGON", 4326)},
  },
  {
    tableName: "targets_target",
  }
);

exports.Target = Target;

const Parameter = sequelize.define(
  "parameter",
  {
    id: {type: Sequelize.STRING(22), primaryKey: true, defaultValue: generateId},
    name: {type: Sequelize.STRING(510)},
    canonical_name: {type: Sequelize.STRING(510), allowNull: false},
    target_id: {
      type: Sequelize.STRING(22),
      allowNull: false,
      references: {
        model: Target,
        key: "id",
      },
    },
    value: {type: Sequelize.JSONB, allowNull: true},
  },
  {
    tableName: "targets_parameter",
  }
);

exports.Parameter = Parameter;

const DataSourceGroup = sequelize.define(
  "datasourcegroup",
  {
    id: {type: Sequelize.STRING(22), primaryKey: true, defaultValue: generateId},
    canonical_name: {type: Sequelize.STRING(510), allowNull: false},
  },
  {
    tableName: "targets_datasourcegroup",
  }
);

exports.DataSourceGroup = DataSourceGroup;

const DataSource = sequelize.define(
  "datasource",
  {
    id: {type: Sequelize.STRING(22), primaryKey: true, defaultValue: generateId},
    hardware_id: {type: Sequelize.STRING(510), allowNull: false},
    name: {type: Sequelize.STRING(510), allowNull: false},
    canonical_name: {type: Sequelize.STRING(510), allowNull: false},
    active: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
    coords: {type: Sequelize.JSONB},
    geometry: {type: Sequelize.GEOMETRY("POINT", 4326)},
    target_id: {
      type: Sequelize.STRING(22),
      allowNull: false,
      references: {
        model: Target,
        key: "id",
      },
    },
  },
  {
    tableName: "targets_datasource",
  }
);

exports.DataSource = DataSource;

const DataSourceInGroup = sequelize.define(
  "datasource_in_group",
  {
    id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    datasourcegroup_id: {
      type: Sequelize.STRING(22),
      allowNull: false,
      references: {
        model: DataSourceGroup,
        key: "id",
      },
    },
    datasource_id: {
      type: Sequelize.STRING(22),
      allowNull: false,
      references: {
        model: DataSource,
        key: "id",
      },
    },
  },
  {
    tableName: "targets_datasource_groups",
  }
);

exports.DataSourceInGroup = DataSourceInGroup;

const Timeseries = sequelize.define(
  "timeseries",
  {
    id: {type: Sequelize.STRING(22), primaryKey: true, defaultValue: generateId},
    name: {type: Sequelize.STRING(255), allowNull: false},
    canonical_name: {type: Sequelize.STRING(510), allowNull: false, unique: true},
    template_name: {type: Sequelize.STRING(510)},
    description: {type: Sequelize.TEXT},
    highlight: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
    active: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
    type: {type: Sequelize.STRING(127), allowNull: false},
    space_coords: {type: Sequelize.STRING(3)},
    labels: {type: Sequelize.JSONB},
    script: {type: Sequelize.TEXT},
    script_version: {type: Sequelize.STRING(255)},
    range_gte: {type: Sequelize.DECIMAL(16, 8)},
    range_gt: {type: Sequelize.DECIMAL(16, 8)},
    range_lte: {type: Sequelize.DECIMAL(16, 8)},
    range_lt: {type: Sequelize.DECIMAL(16, 8)},
    data_source_id: {
      type: Sequelize.STRING(22),
      references: {
        model: DataSource,
        key: "id",
      },
    },
    target_id: {
      type: Sequelize.STRING(22),
      allowNull: false,
      references: {
        model: Target,
        key: "id",
      },
    },
  },
  {
    tableName: "targets_timeseries",
  }
);

exports.Timeseries = Timeseries;

const TimeseriesInput = sequelize.define(
  "timeseries_input",
  {
    id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    from_timeseries_id: {
      type: Sequelize.STRING(22),
      allowNull: false,
      references: {
        model: Timeseries,
        key: "id",
      },
    },
    to_timeseries_id: {
      type: Sequelize.STRING(22),
      allowNull: false,
      references: {
        model: Timeseries,
        key: "id",
      },
    },
  },
  {
    tableName: "targets_timeseries_inputs",
  }
);

exports.TimeseriesInput = TimeseriesInput;

const Threshold = sequelize.define(
  "threshold",
  {
    id: {type: Sequelize.STRING(22), primaryKey: true, defaultValue: generateId},
    created_at: {type: Sequelize.DATE, allowNull: false},
    active: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
    lower: {type: Sequelize.DECIMAL(16, 8)},
    upper: {type: Sequelize.DECIMAL(16, 8)},
    kind: {type: Sequelize.STRING(255)},
    timeseries_id: {
      type: Sequelize.STRING(22),
      allowNull: false,
      references: {
        model: Timeseries,
        key: "id",
      },
    },
  },
  {
    tableName: "targets_threshold",
  }
);

exports.Threshold = Threshold;

const MeasurementProtocol = sequelize.define(
  "measurement_protocol",
  {
    id: {type: Sequelize.STRING(255), primaryKey: true},
  },
  {
    tableName: "targets_measurementprotocol",
  }
);

exports.MeasurementProtocol = MeasurementProtocol;

const AcquiredProtocol = sequelize.define(
  "acquired_protocol",
  {
    id: {type: Sequelize.STRING(22), primaryKey: true, defaultValue: generateId},
    created_at: {type: Sequelize.DATE, allowNull: false, defaultValue: () => new Date()},
    timeseries_id: {
      type: Sequelize.STRING(22),
      allowNull: false,
      references: {
        model: Timeseries,
        key: "id",
      },
    },
    protocol_id: {
      type: Sequelize.STRING(255),
      allowNull: false,
      references: {
        model: MeasurementProtocol,
        key: "id",
      },
    },
    active: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
    meta: {type: Sequelize.JSONB},
  },
  {
    tableName: "targets_acquiredprotocol",
  }
);

exports.AcquiredProtocol = AcquiredProtocol;

Version.belongsTo(ContentType, {foreignKey: "content_type_id"});
Version.belongsTo(Revision, {foreignKey: "revision_id"});
Parameter.belongsTo(Target, {foreignKey: "target_id"});
DataSource.belongsTo(Target, {foreignKey: "target_id"});
DataSourceInGroup.belongsTo(DataSourceGroup, {foreignKey: "datasourcegroup_id"});
DataSourceInGroup.belongsTo(DataSource, {foreignKey: "datasource_id"});
Timeseries.belongsTo(Target, {foreignKey: "target_id"});
Timeseries.belongsTo(DataSource, {foreignKey: "data_source_id"});
Threshold.belongsTo(Timeseries, {foreignKey: "timeseries_id"});

const TimeseriesInputAssoc = TimeseriesInput.belongsTo(Timeseries, {
  foreignKey: "to_timeseries_id",
  as: "input",
});

exports.TimeseriesInputAssoc = TimeseriesInputAssoc;

const TimeseriesDerivationAssoc = TimeseriesInput.belongsTo(Timeseries, {
  foreignKey: "from_timeseries_id",
  as: "derivation",
});

exports.TimeseriesDerivationAssoc = TimeseriesDerivationAssoc;

AcquiredProtocol.belongsTo(Timeseries, {foreignKey: "timeseries_id"});
AcquiredProtocol.belongsTo(MeasurementProtocol, {foreignKey: "protocol_id"});
