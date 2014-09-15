# STOMP utils

Provides command-line interface utilities for sending and receiving messages from a STOMP message broker.

## Install

```bash
npm install -g stomp-utils
```

### Configure

Store connection settings in a config file to be used by the send and subscribe commands.

```bash
stomp configure [options]
```

Options:
```
   -o, --output   filename of output config file  [.stomp_config.yml]
```

The config file is searched for in the current working directory and then in the user home directory.

### Send

Send a message to a broker.

```bash
stomp send [options]
```

The `---destination` option is required.

Options:
```
   -c, --config        filename of config file  [.stomp_config.yml]
   --inline-config     load config from failover uri
   -d, --destination   set destination header
   --content-type      set content-type headder
   --input-file        send file
   --input-string      send string
```


### Subscribe

Consume a single message from a broker.

```bash
stomp subscribe [options]
```

The `---destination` option is required.

Options:
```
   -c, --config        filename of config file  [.stomp_config.yml]
   --inline-config     load config from failover uri
   -d, --destination   set destination header
   --no-ack            don't send acknowledgement
   --nack              send negative acknowledgement
```

The message payload is written to standard output.
