import { createLibp2p } from 'libp2p';
import { preSharedKey } from 'libp2p/pnet';
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { mplex } from '@libp2p/mplex'
import { tcp } from '@libp2p/tcp';
import { webSockets } from '@libp2p/websockets';
import { bootstrap } from '@libp2p/bootstrap'
import { floodsub } from '@libp2p/floodsub'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { circuitRelayTransport, circuitRelayServer } from 'libp2p/circuit-relay'
import { identifyService } from 'libp2p/identify'


export class BootstrapNode
{
	/**
	 * @typedef {import('peer-id')} PeerId
	 */

	/**
	 * @typedef {Object} HopRelayOptions
	 * @property {PeerId} [peerId]
	 * @property {string[]} [listenAddresses = []]
	 * @property {string[]} [announceAddresses = []]
	 * @property {boolean} [pubsubDiscoveryEnabled = true]
	 * @property {string[]} [pubsubDiscoveryTopics = ['_peer-discovery._p2p._pubsub']] uses discovery default
	 */

	/**
	 * Create a Libp2p Relay with HOP service
	 *
	 * @param {HopRelayOptions} options
	 * @returns {Promise<Libp2p>}
	 */
	static async create(
		{
			peerId = undefined,
			swarmKey = undefined,
			listenAddresses = [],
			announceAddresses = []
		}
	)
	{
		// let options = {
		// 	peerId : peerId,
		// 	modules : {
		// 		transport : [ Websockets, TCP ],
		// 		streamMuxer : [ MPLEX ],
		// 		connEncryption : [ NOISE ],
		// 		pubsub : GossipSub,
		// 		peerDiscovery : [ pubsubPeerDiscovery({
		// 			interval: 1000
		// 		}) ]
		// 	},
		// 	addresses : {
		// 		listen : listenAddresses,
		// 		announce : announceAddresses
		// 	},
		// 	config : {
		// 		pubsub : {
		// 			enabled : pubsubDiscoveryEnabled
		// 		},
		// 		peerDiscovery : {
		// 			[ PubsubPeerDiscovery.tag ] : {
		// 				topics : pubsubDiscoveryTopics,
		// 				enabled : pubsubDiscoveryEnabled
		// 			}
		// 		},
		// 		relay : {
		// 			enabled : true, // Allows you to dial and accept relayed connections. Does not make you a relay.
		// 			hop : {
		// 				enabled : true // Allows you to be a relay for other peers
		// 			}
		// 		}
		// 	}
		// };

		//
		//   connectionGater: ConnectionGater
		//
		//   /**
		//    * libp2p transport manager configuration
		//    */
		//   transportManager: TransportManagerInit
		//
		//   /**
		//    * An optional datastore to persist peer information, DHT records, etc.
		//    *
		//    * An in-memory datastore will be used if one is not provided.
		//    */
		//   datastore: Datastore
		//
		//   /**
		//    * libp2p PeerStore configuration
		//    */
		//   peerStore: PersistentPeerStoreInit
		//
		//   /**
		//    * keychain configuration
		//    */
		//   keychain: KeyChainInit
		//
		//
		let options = {
			peerId: peerId,
			addresses : {
				listen : listenAddresses,
				//announce: ['/dns4/auto-relay.libp2p.io/tcp/443/wss/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3']
				announce : announceAddresses,
			},
			transports : [
				tcp(),
				webSockets(),
				circuitRelayTransport()
			],
			streamMuxers : [
				yamux(), mplex()
			],
			connectionEncryption : [
				noise()
			],
			peerDiscovery: [
				pubsubPeerDiscovery({
					interval: 1000
				})
			],
			services : {
				identify : identifyService(),
				relay : circuitRelayServer(),
				pubsub: floodsub({
					enabled: true,

					//	handle this many incoming pubsub messages concurrently
					messageProcessingConcurrency: 32,

					//	How many parallel incoming streams to allow on the pubsub protocol per-connection
					maxInboundStreams: 32,

					//	How many parallel outgoing streams to allow on the pubsub protocol per-connection
					maxOutboundStreams: 32,

					//		const {
					// 			multicodecs = [],
					// 			globalSignaturePolicy = 'StrictSign',
					// 			canRelayMessage = false,
					// 			emitSelf = false,
					// 			messageProcessingConcurrency = 10,
					// 			maxInboundStreams = 1,
					// 			maxOutboundStreams = 1
					// 		} = props
				}),

			},
			connectionManager: {
				maxConnections: 1024,
				minConnections: 2
			}
		};
		if ( swarmKey )
		{
			options.connectionProtector = preSharedKey( {
				psk : swarmKey
			} );
		}

		const node = await createLibp2p( options );
		node.addEventListener( 'peer:connect', ( evt ) =>
		{
			try
			{
				const peerId = evt.detail;
				console.log( 'Connection established to:', peerId.toString() ) // Emitted when a peer has been found
			}
			catch ( err )
			{
				console.error( err );
			}
		} );
		node.addEventListener( 'peer:discovery', ( evt ) =>
		{
			try
			{
				const peerInfo = evt.detail;
				//console.log( `peerInfo : `, peerInfo );
				//node.dial( peerInfo.id );
				console.log( `Discovered: ${ peerInfo.id.toString() }` );
			}
			catch ( err )
			{
				console.error( err );
			}
		} );

		return node;
	}
}
