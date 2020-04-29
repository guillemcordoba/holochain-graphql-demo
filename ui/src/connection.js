// hc-web-client.js is Holochain’s JavaScript library that helps
// you easily set up a WebSocket connection to your app.
// And it is a thin wrapper around rpc-websockets to enable calling zome functions
// in Holochain apps installed in a conductor.
// More info: https://github.com/holochain/hc-web-client
import { connect } from '@holochain/hc-web-client';

let connection = undefined;
const HOST_URL = 'ws://localhost:8888';

export async function getConnection() {
  // return connection if already established
  if (connection) return connection;

  // establish a new websocket connection and expose callZome
  const { callZome } = await connect({ url: HOST_URL });

  // define connection and execute callZome function
  connection = (instance, zome, fnName) => async params => {
    console.log(
      `Calling zome function: ${instance}/${zome}/${fnName} with params`,
      params
    );

    // https://developer.holochain.org/docs/guide/conductor_json_rpc_api/
    const result = await callZome(instance, zome, fnName)(params);

    console.log(
      `Zome function ${instance}/${zome}/${fnName} with params returned`,
      result
    );

    const parsed = JSON.parse(result);

    if (result.Err) throw new Error(JSON.stringify(result.Err));
    if (result.SerializationError) {
      throw new Error(JSON.stringify(result.SerializationError));
    }

    return parsed.Ok !== undefined ? parsed.Ok : parsed
  };

  return connection;
}
