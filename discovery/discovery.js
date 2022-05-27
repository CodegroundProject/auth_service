const consul = require("consul")
const CONSUL_ID = require('uuid').v4();
let details = {
    name: 'Codeground auth',
    address: process.env.HOST,
    port: process.env.PORT,
    id: CONSUL_ID,
    check: {
        ttl: '10s',
        deregister_critical_service_after: '1m'
    }
};

const consulClient = new consul()

const startHeartBeating = () => {
    consulClient.agent.service.register(details, err => {
        // schedule heartbeat
        if (err) {
            return
        }
        setInterval(() => {
            consulClient.agent.check.pass({ id: `service:${CONSUL_ID}` }, err => {
                if (err) throw new Error(err);
                console.log('told Consul that we are healthy');
            });
        }, 5 * 1000);

    });

    process.on('SIGINT', () => {
        console.log('SIGINT. De-Registering...');
        let details = { id: CONSUL_ID };

        consulClient.agent.service.deregister(details, (err) => {
            console.log('de-registered.', err);
            process.exit();
        });
    });

}

module.exports = { startHeartBeating }