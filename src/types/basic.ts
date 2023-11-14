export type Header = "Content-Type" | "Authorization" | "User-Agent"
    | "Access-Control-Allow-Origin" | "Access-Control-Max-Age" | "Access-Control-Allow-Headers"
    | "Access-Control-Allow-Credentials" | "Access-Control-Expose-Headers" | "Vary" | "Accept"
    | "Accept-Encoding" | "Accept-Language" | "Connection" | "Cache-Control" | "Set-Cookie" | "Cookie"
    | "Referer" | "Content-Length" | "Date" | "Expect" | "Server" | "Location" | "If-Modified-Since" | "ETag"
    | "X-XSS-Protection" | "X-Content-Type-Options" | "Referrer-Policy" | "Expect-CT" | "Content-Security-Policy"
    | "Cross-Origin-Opener-Policy" | "Cross-Origin-Embedder-Policy" | "Cross-Origin-Resource-Policy"
    | "Permissions-Policy" | "X-Powered-By" | "X-DNS-Prefetch-Control" | "Public-Key-Pins"
    | "X-Frame-Options" | "Strict-Transport-Security" | (string & {});

export type RedirectStatus = 301 | 302 | 307 | 308;

export type Status =
    // 1xx 
    100 | 101 | 102 | 103
    // 2xx
    | 200 | 201 | 202 | 203 | 204 | 205 | 206
    | 207 | 208 | 226
    // 3xx
    | 300 | 303 | 304 | RedirectStatus
    // 4xx
    | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407
    | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415
    | 416 | 417 | 418 | 422 | 423 | 424 | 425
    | 426 | 428 | 429 | 431 | 451
    // 5xx
    | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507
    | 508 | 510 | 511
    // Other 
    | (number & {}) | (bigint & {});

export type StatusText =
    // 1xx Informational
    | "Continue"
    | "Switching Protocols"
    | "Processing"
    | "Early Hints"
    // 2xx Success
    | "OK"
    | "Created"
    | "Accepted"
    | "Non-Authoritative Information"
    | "No Content"
    | "Reset Content"
    | "Partial Content"
    | "Multi-Status"
    | "Already Reported"
    | "IM Used"
    // 3xx Redirection
    | "Multiple Choices"
    | "Moved Permanently"
    | "Found"
    | "See Other"
    | "Not Modified"
    | "Temporary Redirect"
    | "Permanent Redirect"
    // 4xx Client Error
    | "Bad Request"
    | "Unauthorized"
    | "Payment Required"
    | "Forbidden"
    | "Not Found"
    | "Method Not Allowed"
    | "Not Acceptable"
    | "Proxy Authentication Required"
    | "Request Timeout"
    | "Conflict"
    | "Gone"
    | "Length Required"
    | "Precondition Failed"
    | "Payload Too Large"
    | "URI Too Long"
    | "Unsupported Media Type"
    | "Range Not Satisfiable"
    | "Expectation Failed"
    | "I'm a teapot"
    | "Unprocessable Entity"
    | "Locked"
    | "Failed Dependency"
    | "Too Early"
    | "Upgrade Required"
    | "Precondition Required"
    | "Too Many Requests"
    | "Request Header Fields Too Large"
    | "Unavailable For Legal Reasons"
    // 5xx Server Error
    | "Internal Server Error"
    | "Not Implemented"
    | "Bad Gateway"
    | "Service Unavailable"
    | "Gateway Timeout"
    | "HTTP Version Not Supported"
    | "Variant Also Negotiates"
    | "Insufficient Storage"
    | "Loop Detected"
    | "Not Extended"
    | "Network Authentication Required"

    // Accept others
    | (string & {});
