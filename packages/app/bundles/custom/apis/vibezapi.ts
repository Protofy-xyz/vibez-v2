
const API = {
    get: (endpoint) => {
        const SERVER = process?.env?.API_URL ?? 'http://localhost:8080';
        const url = SERVER + endpoint;
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('response error');
                }
                return response.json();
            })
            .then(data => {
                return data;
            })
            .catch(e => {
                console.error('Api error', e);
                throw e;
            });
    }
}


export default (app, context) => {

    const { mqtt } = context

    const listeners = [];

    const topicSub = (topic, cb) => {
        listeners.push({ topic: topic, cb: cb });
    };

    const topicPub = (topic, data) => {
        mqtt.publish(topic, data)
    }

    mqtt.on("message", (topic, message) => {
        const parsedMessage = message.toString();
        listeners.forEach(listener => {
            if (topic.startsWith(listener.topic)) {
                listener.cb(parsedMessage, topic);
            }
        });
    });


    const deviceSub = (deviceName, componentType, componentName, callback) => {
        const topic = deviceName + '/' + componentType + '/' + componentName + "/state";
        mqtt.subscribe(topic, (err) => {
            if (err) {
                console.error("Error subscribing to topic", err);
                return;
            }
        });
        return topicSub(topic, callback);
    };

    // COMPONENT ES UNDEFINED, BUSCAR PQ NO HO TROBA
    const devicePub = async (deviceName, componentName, command, payload?) => {
        let devices
        try {
            const data = await API.get('/adminapi/v1/devices?itemsPerPage=1000');
            devices = data
        } catch (e) {
            console.error('Error in devicePub:', e);
        }
        const device = devices?.items.find(i => i.name == deviceName)
        const component = device.subsystem.find(s => s.name == componentName)
        let action = payload ? component.actions[0] : component.actions.find(a => a.payload.value == command)
        topicPub(deviceName + action?.endpoint, payload ? JSON.stringify(payload) : command)
    }


    let anyButtonPressed = false;

    const disableSharpTemp = () => {
        console.log('IN')
        anyButtonPressed = true;
        setTimeout(() => {
            anyButtonPressed = false;
            devicePub("mydevice", "lights", "ON", {
                state: "ON",
                effect: "none",
                color: { r: 255, g: 255, b: 255 }
            })
        }, 5000);
    }
    // / BUTTON LOGIC
    deviceSub("mydevice", "binary_sensor", "button16", (message) => {
        console.log("button: ", message)
        if (message == 'OFF') {
            disableSharpTemp()
            devicePub("mydevice", "lights", "ON", {
                state: "ON",
                effect: "Rainbow Effect With Custom Values",
                color: { r: 255, g: 255, b: 255 },
            })
        } else if (message == 'ON') {
        }
    })
    deviceSub("mydevice", "binary_sensor", "button17", (message) => {
        console.log("button: ", message)
        if (message == 'OFF') {
            disableSharpTemp()

            devicePub("mydevice", "lights", "ON", {
                state: "ON",
                effect: "Color Wipe Effect With Custom Values",
                color: { r: 255, g: 100, b: 50 },
            })
        } else if (message == 'OFF') {
        }
    })
    deviceSub("mydevice", "binary_sensor", "button34", (message) => {
        console.log("button: ", message)
        if (message == 'OFF') {
            disableSharpTemp()

            devicePub("mydevice", "lights", "ON", {
                state: "ON",
                effect: "Strobe Effect With Custom Values",
                color: { r: 255, g: 100, b: 50 },
            })
        } else if (message == 'OFF') {
        }
    })
    deviceSub("mydevice", "binary_sensor", "button25", (message) => {
        console.log("button: ", message)
        if (message == 'OFF') {
            disableSharpTemp()

            devicePub("mydevice", "lights", "ON", {
                state: "ON",
                effect: "Fast Pulse",
                color: { r: 0, g: 200, b: 50 },
            })
        } else if (message == 'OFF') {
        }
    })

    // SENSORS LOGIC

    deviceSub("mydevice", "binary_sensor", "tilt", (message) => {
        console.log("tilt: ", message)
        if (message == 'OFF') {
            disableSharpTemp()

            devicePub("mydevice", "lights", "ON", {
                state: "ON",
                effect: "Flicker Effect With Custom Values",
                color: { r: 255, g: 0, b: 0 },
            })
        } else if (message == 'OFF') {
        }
    })
    deviceSub("mydevice", "binary_sensor", "impact", (message) => {
        if (message == 'ON') {
            disableSharpTemp()

            devicePub("mydevice", "lights", "ON", {
                state: "ON",
                effect: "Strobe Effect With Custom Values",
                color: { r: 255, g: 255, b: 0 },
            })
        } else if (message == 'OFF') {
        }
    })
    deviceSub("mydevice", "binary_sensor", "micro", (message) => {
        if (message == 'ON') {
            disableSharpTemp()
            devicePub("mydevice", "lights", "ON", {
                state: "ON",
                effect: "My Fast Random Effect",
                color: { r: 255, g: 0, b: 0 },
            })
        } else if (message == 'OFF') {
        }
    })

    let color = { r: 255, g: 255, b: 255 };
    let sensorValues = { r: 0, g: 0, b: 0 };

    const scaleSensorValue = (value) => {
        return 255 - Math.max(0, Math.min(255, Math.round(255 * (2 - value) / (2 - 0.40))));
    };

    const updateColor = () => {
        Object.keys(sensorValues).forEach(key => {
            color[key] = scaleSensorValue(sensorValues[key]);
        });
    };
    let whitePublished = false

    const handleSensorInput = (sensorName, message) => {
        sensorValues[sensorName] = message;
        updateColor();
        if (sensorValues.r > 0.50 || sensorValues.g > 0.50 || sensorValues.b > 0.50) {
            console.log('IN')
            devicePub("mydevice", "lights", "ON", {
                state: "ON",
                effect: "none",
                color: color,
            })
            whitePublished = false
        } else if (!whitePublished && color.r == 0 && color.g == 0 && color.b == 0) {
            console.log('OUT')
            whitePublished = true
            devicePub("mydevice", "lights", "ON", {
                state: "ON",
                effect: "none",
                color: { r: 255, g: 255, b: 255 },
            })
        }
    }

    deviceSub("mydevice", "sensor", "sharpcentre", (message) => {
        if (!anyButtonPressed) handleSensorInput("b", message);
    });
    deviceSub("mydevice", "sensor", "sharpdreta", (message) => {
        if (!anyButtonPressed) handleSensorInput("g", message);
    });
    deviceSub("mydevice", "sensor", "sharpesq", (message) => {
        if (!anyButtonPressed) handleSensorInput("r", message);
    });
}
