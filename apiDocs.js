// MOVE INTO SRC DIR TO RUN APIDOC COMMANDS

/**
 * @apiDefine ApiErrorBadRequest
 *
 * @apiError (400 BAD REQUEST) {String} error_type Type of error.
 * @apiError (400 BAD REQUEST) {String} message Error message.
 * @apiError (400 BAD REQUEST) {String[]} errors Optional array of error strings.
 */

/**
 * @apiDefine ApiErrorNotFound
 *
 * @apiError (404 NOT FOUND) {String} error_type Type of error.
 * @apiError (404 NOT FOUND) {String} message Error message.
 * @apiError (404 NOT FOUND) {String[]} errors Optional array of error strings.
 */

/**
 * @apiDefine AuthToken
 *
 * @apiHeader {String} authorization Firebase authorization token.
 *
 * @apiHeaderExample {json} Header-Example:
 *      {
 *          "Authorization": "98234rnf082hihiefnh8024ng42ieoh9f2h8h2rh0h8"
 *      }
 *
 *
 * @apiError (401 UNAUTHORIZED) {String} error_type Type of error.
 * @apiError (401 UNAUTHORIZED) {String} message Error message.
 * @apiError (401 UNAUTHORIZED) {String[]} errors Optional array of error strings.
 *
 * @apiErrorExample {json} Expired-Token-Error-Response:
 *      HTTP/1.1 401 UNAUTHORIZED
 *      {
 *          "error_type": "AUTHORIZATION",
 *          "message": "Error while verifying token",
 *          "errors": [
 *              "auth/id-token-expired"
 *          ]
 *      }
 *
 * @apiErrorExample {json} Invalid-Token-Error-Response:
 *      HTTP/1.1 401 UNAUTHORIZED
 *      {
 *          "error_type": "AUTHORIZATION",
 *          "message": "Error while verifying token",
 *          "errors": [
 *              "auth/argument-error"
 *          ]
 *      }
 *
 * @apiError (403 FORBIDDEN) {String} error_type Type of error.
 * @apiError (403 FORBIDDEN) {String} message Error message.
 * @apiError (403 FORBIDDEN) {String[]} errors Optional array of error strings.
 *
 * @apiErrorExample {json} No-Token-Error-Response:
 *      HTTP/1.1 403 FORBIDDEN
 *      {
 *          "error_type": "AUTHORIZATION",
 *          "message": "Unauthorized. Please provide a token."
 *      }
 */
