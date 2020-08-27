const amqp = require("amqplib");

const conf = require("./conf");
const {dispatch} = require("./handler");
const log = require("./log");
const {setup} = require("./timeseries");

// Keep track of the connection, for maintenance
let connection = null;

// Connects to the broker and yields the connection
const connect = () =>
  Promise.race([
    amqp
      .connect(
        [
          conf.AMQP_SSL ? "amqps" : "amqp",
          "://",
          conf.AMQP_USERNAME,
          ":",
          conf.AMQP_PASSWORD,
          "@",
          conf.AMQP_HOST,
          ":",
          conf.AMQP_PORT,
          conf.AMQP_VHOST.startsWith("/") ? conf.AMQP_VHOST : `/${conf.AMQP_VHOST}`,
        ].join("")
      )
      .then((conn) => {
        connection = conn;
        process.once("SIGINT", conn.close.bind(conn));
        process.once("SIGTERM", conn.close.bind(conn));
        return conn;
      }),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("amqp broker connection timeout")),
        conf.AMQP_CONNECTION_TIMEOUT
      )
    ),
  ]);

exports.connect = connect;

// Runs the consume loop, dispatching each message to the handler and
// forwarding each result.
const work = (topic) =>
  setup()
    .then(connect)
    .then((conn) => {
      log.info(`Connected! Topic '${topic}'`);
      return conn;
    })
    .then((conn) => conn.createChannel().then((ch) => ({conn, ch})))
    .then(({conn, ch}) =>
      ch
        .assertExchange(conf.AMQP_EXCHANGE, "topic")
        .then(() =>
          ch.assertQueue(conf.AMQP_QUEUE, {
            arguments: {
              "x-message-ttl": conf.AMQP_MESSAGE_TTL,
              "x-expires": Math.max(conf.AMQP_MESSAGE_TTL, conf.AMQP_QUEUE_TTL),
            },
          })
        )
        .then(() => ch.prefetch(conf.AMQP_PREFETCH))
        .then(({queue}) =>
          ch.bindQueue(queue, conf.AMQP_EXCHANGE, topic).then(() =>
            ch.consume(
              queue,
              (msg) =>
                log.context(() =>
                  dispatch(msg.content.toString())
                    .catch(log.exception)
                    .then((outputs) => {
                      ch.ack(msg);
                      return outputs ? forward(conn, outputs) : Promise.resolve(null);
                    })
                ),
              {noAck: false}
            )
          )
        )
    )
    .catch((err) => {
      log.exception(err);
      setTimeout(() => {
        if (connection) {
          log.info("Closing amqp connection");
          connection.close();
          setTimeout(() => process.exit(1), 1000);
        } else {
          process.exit(1);
        }
      }, 2000);
    });

exports.work = work;

// Forwards a message to the forward-exchange
const forward = (() => {
  let channel = null;
  let exchange = null;
  return (conn, message) =>
    (channel === null ? conn.createChannel() : Promise.resolve(channel))
      .then((ch) => {
        channel = ch;
        return exchange === null
          ? channel.assertExchange(conf.AMQP_FEDERATED_EXCHANGE, "fanout")
          : Promise.resolve(null);
      })
      .then(() => {
        exchange = conf.AMQP_FEDERATED_EXCHANGE;
        return channel.publish(
          exchange,
          "ignored.routing.key",
          Buffer.from(JSON.stringify(message), "utf8"),
          {
            contentType: "application/json",
          }
        );
      });
})();

exports.forward = forward;
