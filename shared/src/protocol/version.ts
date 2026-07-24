/**
 * Protocol version negotiated on handshake.
 *
 * Any breaking change to message shapes increments this. The server rejects
 * clients whose protocol version it cannot serve, preventing silent
 * desynchronization between mismatched builds.
 */
export const PROTOCOL_VERSION = 1;
