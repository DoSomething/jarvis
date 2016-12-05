# Jarvis

Documentation os using the Jarvis API.

## Authentication
Jarvis uses oAuth for authenticating requests. Please see [Northar documentation](https://github.com/DoSomething/northstar/blob/dev/documentation/authentication.md) on getting an oAuth token.

## Endpoints

#### Things
Endpoint                  | Functionality                                                     
------------------------- | ------------------------------------------------------------------
`POST v1/some/thing`      | [Do Some Thing](endpoints/some.md#endpoint)

> :memo: A note to be aware of!

<br>

### Errors & Status Codes
Jarvis returns standard HTTP status codes to indicate how a request turned out. In general, `2xx` codes are returned
on successful requests, `4xx` codes indicate an error in the request, and `5xx` error codes indicate an unexpected
problem on the API end.

Code | Meaning
---- | -------
200  | __Okay__ – Everything is awesome.
400  | __Bad Request__ – The request has incorrect syntax.
401  | __Unauthorized__ – The given credentials are invalid or you are not authorized to view that resource.
404  | __Not Found__ – The specified resource could not be found.
418  | __I'm a teapot__ – The user [needs more caffeine](https://www.ietf.org/rfc/rfc2324.txt).
422  | __Unprocessable Entity__ – The request couldn't be completed due to validation errors.
500  | __Internal Server Error__ – Jarvis has encountered an internal error. Please make a bug report with as much detail as possible about what led to the error!
503  | __Service Unavailable__ – Jarvis is temporarily unavailable.
