const http = require('http');
const express = require('express');
const app = express();
const Sentry = require('../../../../build/cjs');
const { assertSessions } = require('../test-utils');
const { TextEncoder } = require('util');

function cleanUpAndExitSuccessfully() {
  server.close();
  clearInterval(flusher._intervalId);
  process.exit(0);
}

function assertSessionAggregates(session, expected) {
  if (!session.aggregates) {
    return;
  }
  // For loop is added here just in the rare occasion that the session count do not land in the same aggregate
  // bucket
  session.aggregates.forEach(function (_, idx) {
    delete session.aggregates[idx].started;
    // Session Aggregates keys need to be ordered for JSON.stringify comparison
    const ordered = Object.keys(session.aggregates[idx])
      .sort()
      .reduce((obj, key) => {
        obj[key] = session.aggregates[idx][key];
        return obj;
      }, {});
    session.aggregates[idx] = ordered;
  });
  assertSessions(session, expected);
}

function makeDummyTransport() {
  return Sentry.createTransport({ recordDroppedEvent: () => undefined, textEncoder: new TextEncoder() }, req => {
    const sessionEnv = req.body
      .split('\n')
      .filter(l => !!l)
      .map(e => JSON.parse(e));

    assertSessionAggregates(sessionEnv[2], {
      attrs: { release: '1.1' },
      aggregates: [{ crashed: 2, errored: 1, exited: 1 }],
    });

    cleanUpAndExitSuccessfully();

    return Promise.resolve({
      statusCode: 200,
    });
  });
}

Sentry.init({
  dsn: 'http://test@example.com/1337',
  release: '1.1',
  transport: makeDummyTransport,
  autoSessionTracking: true,
});
/**
 * Test that ensures that when `autoSessionTracking` is enabled and the express `requestHandler` middleware is used
 * then Single Session should be disabled in favor of sending SessionAggregates.
 */

app.use(Sentry.Handlers.requestHandler());

// Hack that resets the 60s default flush interval, and replaces it with just a one second interval
const flusher = Sentry.getClient()._sessionFlusher;
clearInterval(flusher._intervalId);
flusher._intervalId = setInterval(() => flusher.flush(), 1000);

app.get('/foo', (req, res, next) => {
  res.send('Success');
  next();
});

app.get('/bar', (req, res, next) => {
  throw new Error('bar');
});

app.get('/baz', (req, res, next) => {
  try {
    throw new Error('hey there');
  } catch (e) {
    Sentry.captureException(e);
  }
  res.send('Caught Exception: Baz');
  next();
});

app.use(Sentry.Handlers.errorHandler());

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get(`http://localhost:${port}/foo`);
  http.get(`http://localhost:${port}/bar`);
  http.get(`http://localhost:${port}/bar`);
  http.get(`http://localhost:${port}/baz`);
});
