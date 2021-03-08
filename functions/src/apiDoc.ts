/**
 * @apiDefine InternalServerError
 *
 * @apiError (500 INTERNAL SERVER ERROR) {String} error Error code associated with failure.
 * @apiError (500 INTERNAL SERVER ERROR) {String} message Error string for detailed message.
 *
 * @apiErrorExample {json} Error-Response:
 *      HTTP/1.1 500 Internal Server Error
 *      {
 *          "error": "internal",
 *          "message": "Error: HTTP Error: 500, Internal error encountered."
 *      }
 */

/**
 * @apiDefine BodyValidationError
 *
 * @apiError (400 BAD REQUEST) {String} body Invalid request body.
 *
 * @apiErrorExample {json} Error-Response:
 *      HTTP/1.1 400 Bad Request
 *      {
 *          "body": "Must contain a json body"
 *      }
 */

/**
 * @apiDefine AuthSuccess
 *
 * @apiSuccess (2xx SUCCESS) {String} token Firebase authorization token.
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "token": "nf8urn2802nf2309j2fmgn2209j3rfn30f29hjf2n30f2n30jf"
 *      }
 */

/**
 * @apiDefine AuthHeader
 *
 * @apiHeader {String} authorization Firebase authorization token.
 *
 * @apiHeaderExample {json} Header-Example:
 *      {
 *          "Authorization": "Bearer 98234rnf082hihiefnh8024ng42ieoh9f2h8h2rh0h8"
 *      }
 */
