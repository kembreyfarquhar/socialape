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
 *          "Authorization": "98234rnf082hihiefnh8024ng42ieoh9f2h8h2rh0h8"
 *      }
 *
 * @apiError (403 FORBIDDEN) {String} error Unauthorized, please provide a token.
 *
 * @apiError (401 UNAUTHORIZED) {String} code Error code associated with failure.
 * @apiError (401 UNAUTHORIZED) {String} message Error string for detailed message.
 *
 * @apiErrorExample {json} Error-Response:
 *      {
 *          "code": "auth/id-token-expired",
 *          "message": "Firebase ID token has expired. Get a fresh ID token from your client app and try again (auth/id-token-expired). See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token."
 *      }
 */

//                                |*| REGISTER USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /auth/register Register new user.
 * @apiName RegisterUser
 * @apiGroup Users
 *
 * @apiParam {String} email Mandatory unique email.
 * @apiParam {String} password Mandatory password.
 * @apiParam {String} confirmPassword Mandatory field to match password.
 * @apiParam {String} handle Mandatory unique user handle.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "email": "myexample@email.com",
 *          "password": "verysecurepassword",
 *          "confirmPassword": "verysecurepassword",
 *          "handle": "myhandle"
 *      }
 *
 * @apiUse AuthSuccess
 *
 * @apiUse BodyValidationError
 * @apiError (400 BAD REQUEST) {String} handle This handle is already in use.
 * @apiError (400 BAD REQUEST) {String} email This email is already in use.
 * @apiUse InternalServerError
 */

//                                  |*| LOGIN USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /auth/login Login existing user.
 * @apiName LoginUser
 * @apiGroup Users
 *
 * @apiParam {String} email Mandatory email.
 * @apiParam {String} password Mandatory password.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "email": "myexample@email.com",
 *          "password": "verysecurepassword"
 *      }
 *
 * @apiUse AuthSuccess
 *
 * @apiUse BodyValidationError
 * @apiError (403 FORBIDDEN) {String} general Wrong credentials.
 * @apiUse InternalServerError
 */
//                                  |*| GET ANY USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {get} /users/handle/:handle Get any user.
 * @apiName GetAnyUser
 * @apiGroup Users
 *
 * @apiParam (Query String Param) {String} handle User's unique handle.
 *
 * @apiSuccess (200 OK) {Object} user
 * @apiSuccess (200 OK) {String} user.userId ID of user.
 * @apiSuccess (200 OK) {String} user.email User email.
 * @apiSuccess (200 OK) {String} user.handle User handle.
 * @apiSuccess (200 OK) {String} user.createdAt ISO Timestamp of user creation.
 * @apiSuccess (200 OK) {String} user.imageUrl URL to user's profile image.
 * @apiSuccess (200 OK) {String} user.bio User bio.
 * @apiSuccess (200 OK) {String} user.website User's website.
 * @apiSuccess (200 OK) {String} user.location User's location.
 * @apiSuccess (200 OK) {Object[]} screams List of all screams user has made.
 * @apiSuccess (200 OK) {String} screams.userHandle Handle of user.
 * @apiSuccess (200 OK) {String} screams.screamId Sream's unique ID.
 * @apiSuccess (200 OK) {String} screams.body Scream's body/content.
 * @apiSuccess (200 OK) {String} screams.createdAt ISO String of scream creation.
 * @apiSuccess (200 OK) {String} screams.userImage User profile image URL.
 * @apiSuccess (200 OK) {Number} screams.likeCount Number of likes scream has.
 * @apiSuccess (200 OK) {Number} screams.commentCount Number of comments scream has.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		{
 * 			"user": {
 *   			"bio": "Hello, nice to meet you!",
 *   			"userId": "AM89AAaud5e0ii2oijfZoPRC2",
 *   			"handle": "user",
 *   			"website": "https://user.com",
 *   			"email": "user@gmail.com",
 *   			"createdAt": "2021-03-07T23:40:05.580Z",
 * 				"location": "St. Louis, MO",
 *   			"imageUrl": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/02375.jpg?alt=media"
 * 			},
 * 			"screams": [
 *   			{
 *     				"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/57882232665.png?alt=media&token=23be2613-41aa-407d-9ba4-8casdfasde",
 *     				"body": "It's a beautiful day today. :D",
 *     				"userHandle": "me",
 *     				"commentCount": 0,
 *     				"likeCount": 0,
 *     				"createdAt": "2021-03-11T11:21:10.581Z",
 *     				"screamId": "xWrYsFvVqsmpCjtjDLiV"
 *   			},
 *   			{
 *     				"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/534534465.png?alt=media&token=23be2613-41aa-407d-9ba4-8c0asdfsd6e",
 *     				"createdAt": "2021-03-11T11:08:16.534Z",
 *     				"body": "Hi this is my first scream!",
 *     				"likeCount": 0,
 *     				"commentCount": 0,
 *     				"userHandle": "me",
 *     				"screamId": "eEQjB9xxx78e4iuzNRLc"
 *   			}
 * 			]
 *		}
 *
 * @apiError (404 NOT FOUND) {String} error User not found.
 * @apiUse InternalServerError
 */
//                             |*| GET AUTHENTICATED USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {get} /users/logged-in-user Get Authenticated User Info
 * @apiName GetAuthenticatedUser
 * @apiGroup Users
 *
 * @apiUse AuthHeader
 *
 * @apiSuccessExample {json} Success-Response:
 * 		{
 * 			"credentials": {
 *   			"bio": "Hello, nice to meet you!",
 *   			"email": "me@gmail.com",
 *   			"userId": "sEZtRJvsG5TxmktZ7nMngVPz8Sq1",
 *   			"location": "Missouri",
 *   			"handle": "me",
 *   			"createdAt": "2021-03-11T10:19:56.873Z",
 *   			"website": "http://me.com",
 *   			"imageUrl": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/52352665.png?alt=media&token=23be2613-41aa-407d-245245gesb06e"
 * 		},
 * 			"likes": [
 *     			{
 *     				"userHandle": "me",
 *     				"screamId": "eEQjB9xdfhjfsetyhLc"
 *   			}
 * 			],
 * 			"notifications": [
 *   			{
 *     				"screamId": "eEQjB9xxx78e4iuzNRLc",
 *     				"type": "comment",
 *     				"recipient": "me",
 *     				"createdAt": "2021-03-11T11:30:11.582Z",
 *     				"read": false,
 *     				"sender": "me2",
 *     				"notificationId": "rxEgZmikYKvkt9ZmXur9"
 *   			},
 *   			{
 *     				"read": false,
 *     				"recipient": "me",
 *     				"screamId": "eEQjB9xxx78e4iuzNRLc",
 *     				"createdAt": "2021-03-11T11:28:55.691Z",
 *     				"sender": "me2",
 *     				"type": "like",
 *     				"notificationId": "S36S6kDYDNGAFU7Rmqlv"
 *   			}
 * 			]
 * 		}
 *
 * @apiError (404 NOT FOUND) {String} error User not found
 * @apiUse InternalServerError
 */
//                                |*| POST PROFILE IMAGE |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /users/image Post user profile image.
 * @apiName PostUserImage
 * @apiGroup Users
 *
 * @apiUse AuthHeader
 * @apiHeader {String} Content-Type multipart/form-data
 *
 * @apiParam {FormData} image Mandatory image filepath.
 *
 * @apiSuccess (200 OK) {String} message Image uploaded.
 *
 * @apiError (400 BAD REQUEST) {String} error Wrong file type submitted.
 * @apiError (400 BAD REQUEST) {String} error Image is too large.
 * @apiUse InternalServerError
 */
//                                |*| UPDATE USER DETAILS |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {put} /users/details Update user details.
 * @apiName UpdateUserDetails
 * @apiGroup Users
 *
 * @apiUse AuthHeader
 *
 * @apiParam {String} bio Optional user bio.
 * @apiParam {String} website Optional user website.
 * @apiParam {String} location Optional user location.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "bio": "Hello, nice to meet you, I'm user.",
 *          "website": "https://user.com",
 *          "location": "St. Louis, MO, USA"
 *      }
 *
 * @apiParamExample {json} Request-Example:
 * 		{
 * 			"bio": "",
 * 			"website": "user.com"
 * 		}
 *
 * @apiSuccess (200 OK) {String} message User details updated
 *
 * @apiUse BodyValidationError
 * @apiUse InternalServerError
 */
//                              |*| GET ALL SCREAMS |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {get} /screams Get all Scream Documents
 * @apiName GetAllScreams
 * @apiGroup Screams
 *
 * @apiSuccess (200 OK) {String} id ID of the document
 * @apiSuccess (200 OK) {String} createdAt Timestamp string.
 * @apiSuccess (200 OK) {String} body Scream body/content.
 * @apiSuccess (200 OK) {String} userHandle Handle for scream's creator.
 * @apiSuccess (200 OK) {String} userImage User's profile image URL.
 * @apiSuccess (200 OK) {Number} likeCount Number of likes the scream has.
 * @apiSuccess (200 OK) {Number} commentCount Number of comments the scream has.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		[
 *      	{
 *          	"id": "KJHndjhDKJhdnDHjd",
 *          	"createdAt": "2021-03-06T16:04:36.298Z",
 *          	"body": "This is a scream!",
 *          	"userHandle": "exampleuser",
 * 				"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/0293342.png?alt=media"
 * 				"likeCount": 23,
 * 				"commentCount": 4
 *      	},
 *      	{
 *          	"id": "LKJds09gsPIHJDFLugj",
 *          	"createdAt": "2021-03-06T16:04:36.298Z",
 *          	"body": "This is another scream!",
 *          	"userHandle": "user",
 * 				"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/924754.png?alt=media"
 * 				"likeCount": 5,
 * 				"commentCount": 0
 *      	},
 * 		]
 *
 * @apiUse InternalServerError
 *
 */
//                            |*| GET SCREAM BY ID |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|

/**
 * @api {get} /screams/:screamId Get scream by ID
 * @apiName GetScreamByID
 * @apiGroup Screams
 *
 * @apiParam (Query String Param) {String} screamId Scream's unique ID.
 *
 * @apiSuccess (200 OK) {String} userHandle Handle of user that created scream.
 * @apiSuccess (200 OK) {String} body Body/content of scream.
 * @apiSuccess (200 OK) {String} createdAt ISO String of scream creation.
 * @apiSuccess (200 OK) {String} screamId ID of scream.
 * @apiSuccess (200 OK) {Object[]} comments List of comments for this scream.
 * @apiSuccess (200 OK) {String} comments.createdAt ISO String of comment creation.
 * @apiSuccess (200 OK) {String} comments.userHandle Handle of user whose comment it is.
 * @apiSuccess (200 OK) {String} comments.screamId ID of scream the comment belongs to.
 * @apiSuccess (200 OK) {String} comments.body Body/content of comment.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		{
 *			"userHandle": "user",
 *			"body": "This is my scream!",
 *			"createdAt": "2021-03-07T23:42:07.990Z",
 *			"screamId": "DThsMg40sdofjsd8j",
 *			"comments": [
 *		    	{
 *		      		"createdAt": "2021-03-07T23:45:07.990Z",
 *		      		"userHandle": "otheruser",
 *					"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7237339.jpg?alt=media"
 *		      		"screamId": "DThsMg40sdofjsd8j",
 *		      		"body": "nice scream, dude!"
 *		    	}
 *		  	]
 *		}
 *
 * @apiError (404 NOT FOUND) {String} error Scream not found.
 * @apiUse InternalServerError
 */
//                               |*| POST NEW SCREAM |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /screams Create a new Scream Document
 * @apiName PostScream
 * @apiGroup Screams
 *
 * @apiUse AuthHeader
 *
 * @apiParam {String} body Mandatory scream body/content.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "body": "This is my scream!"
 *      }
 *
 * @apiSuccess (201 CREATED) {String} userHandle User's unique handle.
 * @apiSuccess (201 CREATED) {String} createdAt ISO String of scream creation.
 * @apiSuccess (201 CREATED) {String} body String's body/content.
 * @apiSuccess (201 CREATED) {Number} likeCount Number of likes the scream has.
 * @apiSuccess (201 CREATED) {Number} commentCount Number of comments the scream has.
 * @apiSuccess (201 CREATED) {String} userImage User's profile image URL.
 * @apiSuccess (201 CREATED) {String} screamId Scream's unique ID.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		{
 * 			"userHandle": "user",
 * 			"createdAt": "2021-03-09T20:48:35.498Z",
 * 			"body": "Hi this is my first scream!",
 * 			"likeCount": 0,
 * 			"commentCount": 0,
 * 			"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/757209389.jpg?alt=media",
 * 			"screamId": "S9I7vZBYi9s09fu0n0jd4G"
 *		}
 *
 * @apiUse BodyValidationError
 * @apiUse InternalServerError
 */

//                               |*| POST NEW COMMENT |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /screams/:screamId/comment Create a new comment
 * @apiName PostNewComment
 * @apiGroup Screams
 *
 * @apiUse AuthHeader
 *
 * @apiParam (Query String Param) {String} screamId Scream's unique ID.
 *
 * @apiParam {String} body Comment's body/content.
 *
 * @apiParamExample {json} Request-Example:
 * 		{
 * 			"body": "This is my super cool comment!"
 * 		}
 *
 * @apiSuccess (201 CREATED) {String} userHandle User's unique handle.
 * @apiSuccess (201 CREATED) {String} screamId Scream's unique ID.
 * @apiSuccess (201 CREATED) {String} createdAt ISO String of comment's creation.
 * @apiSuccess (201 CREATED) {String} body Body/content of comment.
 * @apiSuccess (201 CREATED) {String} userImage User's profile image URL.
 * @apiSuccess (201 CREATED) {Number} likeCount Number of likes scream has.
 * @apiSuccess (201 CREATED) {Number} commentCount Number of comments a scream has.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		{
 * 			"userHandle": "user",
 * 			"screamId": "DThsMg42rhXvw9i5WJvj",
 * 			"createdAt": "2021-03-09T20:58:04.154Z",
 * 			"body": "This is my super cool comment!",
 * 			"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7273339.jpg?alt=media",
 * 			"likeCount": 0,
 * 			"commentCount": 0
 * 		}
 *
 * @apiError (404 NOT FOUND) {String} error Scream not found
 *
 * @apiUse BodyValidationError
 * @apiUse InternalServerError
 */
//                                 |*| LIKE A SCREAM |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /screams/:screamId/like Post a Like on a Scream
 * @apiName PostScreamLike
 * @apiGroup Screams
 *
 * @apiUse AuthHeader
 *
 * @apiParam (Query String Param) {String} screamId Scream's unique ID.
 *
 * @apiSuccess (201 CREATED) {String} userHandle User's unique handle.
 * @apiSuccess (201 CREATED) {String} screamId Scream's unique ID.
 * @apiSuccess (201 CREATED) {String} createdAt ISO String of like's creation.
 * @apiSuccess (201 CREATED) {String} body Body/content of scream.
 * @apiSuccess (201 CREATED) {String} userImage User's profile image URL.
 * @apiSuccess (201 CREATED) {Number} likeCount Number of likes on scream.
 * @apiSuccess (201 CREATED) {Number} commentCount Number of comments on scream.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		{
 * 			"userHandle": "user",
 * 			"screamId": "DThsMg42rhXvw9i5WJvj",
 * 			"createdAt": "2021-03-09T20:58:04.154Z",
 * 			"body": "This is my super cool comment!",
 * 			"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7273339.jpg?alt=media",
 * 			"likeCount": 24,
 * 			"commentCount": 3
 * 		}
 *
 * @apiError (404 NOT FOUND) {String} error Scream not found.
 *
 * @apiError (400 BAD REQUEST) {String} error Scream already liked.
 *
 * @apiUse InternalServerError
 */

//                                 |*| UNLIKE A SCREAM |*|
// ====================================================================================|
//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {DELETE} /screams/:screamId/unlike Delete a like from a Scream
 * @apiName DeleteScreamLike
 * @apiGroup Screams
 *
 * @apiUse AuthHeader
 *
 * @apiParam (Query String Param) {String} screamId Scream's unique ID.
 *
 * @apiSuccess (200 OK) {String} userHandle User's unique handle.
 * @apiSuccess (200 OK) {String} screamId Scream's unique ID.
 * @apiSuccess (200 OK) {String} createdAt ISO String of like's creation.
 * @apiSuccess (200 OK) {String} body Body/content of scream.
 * @apiSuccess (200 OK) {String} userImage User's profile image URL.
 * @apiSuccess (200 OK) {Number} likeCount Number of likes on scream.
 * @apiSuccess (200 OK) {Number} commentCount Number of comments on scream.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		{
 * 			"userHandle": "user",
 * 			"screamId": "DThsMg42rhXvw9i5WJvj",
 * 			"createdAt": "2021-03-09T20:58:04.154Z",
 * 			"body": "This is my super cool comment!",
 * 			"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7273339.jpg?alt=media",
 * 			"likeCount": 23,
 * 			"commentCount": 3
 * 		}
 *
 * @apiError (404 NOT FOUND) {String} error Scream not found.
 *
 * @apiError (400 BAD REQUEST) {String} error Scream not liked.
 *
 * @apiUse InternalServerError
 */
