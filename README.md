# yall2

Yet Another Logging Library

- builds on [winston](https://github.com/winstonjs/winston)
- configurable through [extol](https://github.com/csabasulyok/extol)
- convenience integration for [morgan](https://github.com/expressjs/morgan) and [axios](https://github.com/axios/axios)

# Environment variables

| Name           | Type      | Default value | Description                                                     |
| -------------- | --------- | ------------- | --------------------------------------------------------------- |
| YALL_LEVEL     | `String`  | `info`        | Winston log level                                               |
| YALL_FILENAME  | `String`  | _none_        | File to log messages into (by default, blank = no file logging) |
| YALL_COLORED   | `boolean` | `true`        | Whether to use coloring log formatter                           |
| YALL_TIMESTAMP | `boolean` | `true`        | Whether to prepend log messages with current timestamp          |

# Usage examples

## 1. Message logging

```ts
import yall from 'yall2';

yall.debug('Debug level message');
yall.info('Info level message');
yall.warn('Warn level message');
yall.error('Error level message');
```

### Running

```bash
# default params
npm run example
# set log level
YALL_LEVEL=debug npm run example
# disable colored output
YALL_COLORED=false npm run example
# disable adding timestamps
YALL_TIMESTAMP=false npm run example
# log to file without color
YALL_FILENAME=out.log YALL_COLORED=false npm run example
```

## 2. Use with express morgan middleware

```ts
import express from 'express';
import yall from 'yall2';
import yallMorgan from 'yall2/yallmorgan';

const app = express();

// connect YALL morgan middleware
// set GET/HEAD call log level to info
app.use(yallMorgan({ readLevel: 'info' }));

// respond with generic text to any request
app.use((req, res) => res.send(`Hello, you have sent ${req.method} to path ${req.url}`));

// start server on port 8080
app.listen(8080, () => yall.info('Listening on port 8080...'));
```

### Running

```bash
npm run example:morgan
```

## 3. Decorate axios instance

```ts
import axios from 'axios';
import yallAxiosConnect from 'yall2/yallaxios';

// decorate default instance
yallAxiosConnect(axios, {
  readLevel: 'info',
});

// should show info level message
await axios.get('https://github.com/csabasulyok');
// should show warning for not found
await axios.get('https://github.com/fullynotexistent');
```

### Running

```bash
npm run example:axios
```
