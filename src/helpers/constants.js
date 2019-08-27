const CATEGORY_INFORMATION = 'Information';
const CATEGORY_SUCCESSFUL = 'Successful';
/**
 * 글 상태
 */
module.exports.httpStatus = {
    http100: {
        code: 100,
        status: 'Continue',
        category: CATEGORY_INFORMATION,
        description:
            'This interim response indicates that everything so far is OK and that the client should continue with the request or ignore it if it is already finished.',
    },
    http101: {
        code: 101,
        status: 'Switching Protocol',
        category: CATEGORY_INFORMATION,
        desciption:
            'This code is sent in response to an Upgrade request header by the client, and indicates the protocol the server is switching to.',
    },
    http102: {
        code: 102,
        status: 'Processing',
        category: CATEGORY_INFORMATION,
        description:
            'This code indicates that the server has received and is processing the request, but no response is available yet.',
    },
    http103: {
        code: 103,
        status: 'Early Hints',
        category: CATEGORY_INFORMATION,
        description:
            'This status code is primarily intended to be used with the Link header to allow the user agent to start preloading resources while the server is still preparing a response.',
    },
    http200: {
        code: 200,
        status: 'OK',
        category: CATEGORY_SUCCESSFUL,
        description: `The request has succeeded. The meaning of a success varies depending on the HTTP method:
GET: The resource has been fetched and is transmitted in the message body.
            HEAD: The entity headers are in the message body.
PUT or POST: The resource describing the result of the action is transmitted in the message body.
            TRACE: The message body contains the request message as received by the server`,
    },
    http201: {
        code: 201,
        status: 'Created',
        category: CATEGORY_SUCCESSFUL,
        description:
            'The request has succeeded and a new resource has been created as a result of it. This is typically the response sent after a POST request, or after some PUT requests.',
    },
    http202: {
        code: 202,
        status: 'Accepted',
        category: CATEGORY_SUCCESSFUL,
        description:
            'The request has been received but not yet acted upon. It is non-committal, meaning that there is no way in HTTP to later send an asynchronous response indicating the outcome of processing the request. It is intended for cases where another process or server handles the request, or for batch processing.',
    },
    http203: {
        code: 203,
        status: 'Non-Authoritative Information',
        category: CATEGORY_SUCCESSFUL,
        description:
            'This response code means returned meta-information set is not exact set as available from the origin server, but collected from a local or a third party copy. Except this condition, 200 OK response should be preferred instead of this response.',
    },
    http204: {
        code: 204,
        status: 'No Content',
        category: CATEGORY_SUCCESSFUL,
        description:
            'There is no content to send for this request, but the headers may be useful. The user-agent may update its cached headers for this resource with the new ones.',
    },
    http205: {
        code: 205,
        status: 'Reset Content',
        category: CATEGORY_SUCCESSFUL,
        description:
            'This response code is sent after accomplishing request to tell user agent reset document view which sent this request.',
    },
    http206: {
        code: 206,
        status: 'Partial Content',
        category: CATEGORY_SUCCESSFUL,
        description:
            'This response code is used because of range header sent by the client to separate download into multiple streams.',
    },
    http207: {
        code: 207,
        status: 'Multi-Status',
        category: CATEGORY_SUCCESSFUL,
        description:
            'A Multi-Status response conveys information about multiple resources in situations where multiple status codes might be appropriate.',
    },
    http208: {
        code: 208,
        status: 'Multi-Status',
        category: CATEGORY_SUCCESSFUL,
        description:
            'Used inside a DAV: propstat response element to avoid enumerating the internal members of multiple bindings to the same collection repeatedly.',
    },
    http226: {
        code: 226,
        status: 'IM Used',
        category: CATEGORY_SUCCESSFUL,
        description:
            'The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.',
    },
};
