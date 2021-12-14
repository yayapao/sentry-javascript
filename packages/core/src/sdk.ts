import { getCurrentHub } from '@sentry/hub';
import { Client, Options } from '@sentry/types';
import { isDebugBuild, logger } from '@sentry/utils';

/** A class object that can instantiate Client objects. */
export type ClientClass<F extends Client, O extends Options> = new (options: O) => F;

/**
 * Internal function to create a new SDK client instance. The client is
 * installed and then bound to the current scope.
 *
 * @param clientClass The client class to instantiate.
 * @param options Options to pass to the client.
 */
export function initAndBind<F extends Client, O extends Options>(clientClass: ClientClass<F, O>, options: O): void {
  if (options.debug === true) {
    if (!isDebugBuild()) {
      // eslint-disable-next-line no-console
      console.warn('warning: non debug Sentry SDK loaded, debug mode unavailable!');
    }
    logger.enable();
  }
  const hub = getCurrentHub();
  hub.getScope()?.update(options.initialScope);
  const client = new clientClass(options);
  hub.bindClient(client);
}
