<style>
summary {font-size: 1.3rem;}
</style>

<div id="top"></div>

# socialape v0.0.1

> A social media application using firebase functions.

- [Users](#Users)
  - [Get any user](#get-any-user)
  - [Get Authenticated User Info](#get-authenticated-user-info)
  - [Login existing user](#login-existing-user)
  - [Mark all unread notifications as read](#mark-all-unread-notifications-as-read)
  - [Post user profile image](#post-user-profile-image)
  - [Register new user](#register-new-user)
  - [Update user details](#update-user-details)
- [Screams](#Screams)
  - [Delete a like from a Scream](#delete-a-like-from-a-scream)
  - [Delete a Scream](#delete-a-scream)
  - [Get all Scream Documents](#get-all-scream-documents)
  - [Get scream by ID](#get-scream-by-id)
  - [Post a Like on a Scream](#post-a-like-on-a-scream)
  - [Post new comment](#post-new-comment)
  - [Post new Scream Document](#post-new-scream-document)

---

# **Users**

<div id="get-any-user"></div>
<details><summary>Get any user</summary>

[Back to top](#top)

```
GET /users/handle/:handle
```

### Parameters:

`Query String Param`

| Name   | Type     | Description           |
| ------ | -------- | --------------------- |
| handle | `String` | User's unique handle. |

### Success response - `200 OK`

| Name                                             | Type       | Description                        |
| ------------------------------------------------ | ---------- | ---------------------------------- |
| **user**                                         | `Object`   | User object.                       |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;userId       | `String`   | User's unique ID.                  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;email        | `String`   | User's email.                      |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;handle       | `String`   | User's handle.                     |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;createdAt    | `String`   | ISO Timestamp of user creation.    |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;imageUrl     | `String`   | URL to user's profile image.       |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;bio          | `String`   | User's bio.                        |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;website      | `String`   | User's website.                    |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;location     | `String`   | User's location.                   |
| **screams**                                      | `Object[]` | List of all screams user has made. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;userHandle   | `String`   | Handle of user.                    |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;screamId     | `String`   | Sream's unique ID.                 |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;body         | `String`   | Scream's body/content.             |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;createdAt    | `String`   | ISO String of scream creation.     |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;userImage    | `String`   | User profile image URL.            |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;likeCount    | `Number`   | Number of likes scream has.        |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;commentCount | `Number`   | Number of comments scream has.     |

### Success response example:

```json
HTTP/1.1 200 OK
{
	"user": {
		"bio": "Hello, nice to meet you!",
		"userId": "AM89AAaud5e0ii2oijfZoPRC2",
		"handle": "user",
		"website": "https://user.com",
		"email": "user@gmail.com",
		"createdAt": "2021-03-07T23:40:05.580Z",
		"location": "St. Louis, MO",
		"imageUrl": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/02375.jpg?alt=media"
	},
	"screams": [
  		{
    		"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/57882232665.png?alt=media&token=23be2613-41aa-407d-9ba4-8casdfasde",
    		"body": "It's a beautiful day today. :D",
    		"userHandle": "me",
    		"commentCount": 0,
    		"likeCount": 0,
    		"createdAt": "2021-03-11T11:21:10.581Z",
    		"screamId": "xWrYsFvVqsmpCjtjDLiV"
  		},
  		{
    		"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/534534465.png?alt=media&token=23be2613-41aa-407d-9ba4-8c0asdfsd6e",
    		"createdAt": "2021-03-11T11:08:16.534Z",
    		"body": "Hi this is my first scream!",
    		"likeCount": 0,
    		"commentCount": 0,
    		"userHandle": "me",
    		"screamId": "eEQjB9xxx78e4iuzNRLc"
  		}
	]
}
```

### Error Responses:

### Get Any User - `404 NOT FOUND`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

### `User-Not-Found-Error-Response:`

```json
HTTP/1.1 404 NOT FOUND
{
	"error_type": "NETWORK",
	"message": "There is no user record corresponding to this identifier. The user may have been deleted."
}
```

</details>

<div id="get-authenticated-user-info"></div>
<details><summary>Get Authenticated User Info</summary>

[Back to top](#top)

```
GET /users/logged-in-user
```

### Headers:

| Name          | Type     | Description                   |
| ------------- | -------- | ----------------------------- |
| authorization | `String` | Firebase authorization token. |

### Header example:

```json
{ "Authorization": "98234rnf082hihiefnh8024ng42ieoh9f2h8h2rh0h8" }
```

### Success response example:

```json
HTTP/1.1 200 OK
{
	"credentials": {
  	"bio": "Hello, nice to meet you!",
  	"email": "me@gmail.com",
  	"userId": "sEZtRJvsG5TxmktZ7nMngVPz8Sq1",
  	"location": "Missouri",
  	"handle": "me",
  	"createdAt": "2021-03-11T10:19:56.873Z",
  	"website": "http://me.com",
  	"imageUrl": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/52352665.png?alt=media&token=23be2613-41aa-407d-245245gesb06e"
	},
	"likes": [
    	{
    		"userHandle": "me",
    		"screamId": "eEQjB9xdfhjfsetyhLc"
  		}
	],
	"notifications": [
  		{
    		"screamId": "eEQjB9xxx78e4iuzNRLc",
    		"type": "comment",
    		"recipient": "me",
    		"createdAt": "2021-03-11T11:30:11.582Z",
    		"read": false,
    		"sender": "me2",
    		"notificationId": "rxEgZmikYKvkt9ZmXur9"
  		},
  		{
    		"read": false,
    		"recipient": "me",
    		"screamId": "eEQjB9xxx78e4iuzNRLc",
    		"createdAt": "2021-03-11T11:28:55.691Z",
    		"sender": "me2",
    		"type": "like",
    		"notificationId": "S36S6kDYDNGAFU7Rmqlv"
  		}
	]
}
```

### Error responses:

#### `401 UNAUTHORIZED`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Expired-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/id-token-expired"
    ]
}
```

#### `Invalid-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/argument-error"
    ]
}
```

#### `403 FORBIDDEN`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `No-Token-Error-Response:`

```json
HTTP/1.1 403 FORBIDDEN
{
    "error_type": "AUTHORIZATION",
    "message": "Unauthorized. Please provide a token."
}
```

</details>

<div id="login-existing-user"></div>
<details><summary>Login existing user</summary>

[Back to top](#top)

```
POST /auth/login
```

### Parameters - `Request Body`

| Name     | Type     | Description         |
| -------- | -------- | ------------------- |
| email    | `String` | Mandatory email.    |
| password | `String` | Mandatory password. |

### Parameters example:

```json
{
  "email": "myexample@email.com",
  "password": "verysecurepassword"
}
```

### Success response example:

```json
HTTP/1.1 200 OK
{
	"token": "nf8urn2802nOIJIINPINDj2fmgn2209j3rfsdfasgadfghsdfadfgn30f29hjf2n30f2n30jf"
}
```

### Error responses:

#### `400 BAD REQUEST`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Missing-Fields-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "VALIDATION",
	"message": "2 errors occurred",
	"errors": [
		"email is a required field",
		"password is a required field"
	]
}
```

#### `Wrong-Password-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "AUTHENTICATION",
	"message": "The password is invalid or the user does not have a password.",
	"errors": [
  		"auth/wrong-password"
	]
}
```

#### `Email-Not-Valid-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "VALIDATION",
	"message": "email must be a valid email",
	"errors": [
  		"email must be a valid email"
	]
}
```

#### `404 NOT FOUND`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `User-Not-Found-Error-Response:`

```json
HTTP/1.1 404 NOT FOUND
{
	"error_type": "NETWORK",
	"message": "There is no user record corresponding to this identifier. The user may have been deleted.",
	"errors": [
  		"auth/user-not-found"
	]
}
```

</details>

<div id="mark-all-notifications-as-read"></div>
<details><summary>Mark all unread notifications as read</summary>

[Back to top](#top)

```
PATCH /users/mark-notifications-read
```

### Headers:

| Name          | Type     | Description                   |
| ------------- | -------- | ----------------------------- |
| authorization | `String` | Firebase authorization token. |

### Header example:

```json
{ "Authorization": "98234rnf082hihiefnh8024ng42ieoh9f2h8h2rh0h8" }
```

### Success response - `200 OK`:

| Name    | Type     | Description                   |
| ------- | -------- | ----------------------------- |
| message | `String` | Notifications marked as read. |

### Error responses:

#### `401 UNAUTHORIZED`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Expired-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/id-token-expired"
    ]
}
```

#### `Invalid-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/argument-error"
    ]
}
```

#### `403 FORBIDDEN`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `No-Token-Error-Response:`

```json
HTTP/1.1 403 FORBIDDEN
{
    "error_type": "AUTHORIZATION",
    "message": "Unauthorized. Please provide a token."
}
```

</details>

<div id="post-user-profile-image"></div>
<details><summary>Post user profile image</summary>

[Back to top](#top)

```
POST /users/image
```

### Headers:

| Name          | Type     | Description                   |
| ------------- | -------- | ----------------------------- |
| Content-Type  | `String` | multipart/form-data           |
| Authorization | `String` | Firebase authorization token. |

### Header-Example:

```json
{ "Authorization": "98234rnf082hihiefnh8024ng42ieoh9f2h8h2rh0h8" }
```

### Parameters - `Request Body`

| Name  | Type       | Description               |
| ----- | ---------- | ------------------------- |
| image | `FormData` | Mandatory image filepath. |

### Success response - `200 OK`:

| Name    | Type     | Description     |
| ------- | -------- | --------------- |
| message | `String` | Image uploaded. |

### Error responses:

#### `400 BAD REQUEST`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Wrong-Content-Type-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "NETWORK",
	"message": "Request must include Content-Type Header set to multipart/form-data"
}
```

#### `Wrong-File-Type-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "NETWORK",
	"message": "Wrong file type submitted. Please only use JPEG or PNG files for images."
}
```

#### `Image-Too-Large-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "NETWORK",
	"message": "Image is too large."
}
```

#### `401 UNAUTHORIZED`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Expired-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/id-token-expired"
    ]
}
```

#### `Invalid-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/argument-error"
    ]
}
```

#### `403 FORBIDDEN`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `No-Token-Error-Response:`

```json
HTTP/1.1 403 FORBIDDEN
{
    "error_type": "AUTHORIZATION",
    "message": "Unauthorized. Please provide a token."
}
```

</details>

<div id="register-new-user"></div>
<details><summary>Register new user</summary>

[Back to top](#top)

```
POST /auth/register
```

### Parameters - `Request Body`

| Name            | Type     | Description                                             |
| --------------- | -------- | ------------------------------------------------------- |
| email           | `String` | Mandatory unique email.                                 |
| password        | `String` | Mandatory password, must be at least 8 characters long. |
| confirmPassword | `String` | Mandatory field, must match password.                   |
| handle          | `String` | Mandatory unique user handle.                           |

### Parameters example:

```json
{
  "email": "myexample@email.com",
  "password": "verysecurepassword",
  "confirmPassword": "verysecurepassword",
  "handle": "myhandle"
}
```

### Success response - `201 CREATED`:

| Name  | Type     | Description                   |
| ----- | -------- | ----------------------------- |
| token | `String` | Firebase authorization token. |

### Success response example:

```json
HTTP/1.1 201 CREATED
{
    "token": "nf8urn2802nf2309j2fmgn2209j3rfsdfasgadfghsdfadfgn30f29hjf2n30f2n30jf"
}
```

### Error responses:

#### `400 BAD REQUEST`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Missing-Fields-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "VALIDATION",
	"message": "4 errors occurred",
	"errors": [
		"email is a required field",
		"handle is a required field",
		"password is a required field",
		"confirmPassword is a required field"
	]
}
```

#### `Handle-Taken-Error-Response:`

```json
HTTP/1.1 400 Bad Request
{
	"error_type": "AUTHENTICATION",
	"message": "This handle is already in use by another account."
}
```

#### `Email-Taken-Error-Response:`

```json
HTTP/1.1 400 Bad Request
{
	"error_type": "AUTHENTICATION",
	"message": "This email address is already in use by another account.",
	"errors": [
		"auth/email-already-in-use"
	]
}
```

#### `Password-Length-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "VALIDATION",
	"message": "Password must be at least 8 characters long",
	"errors": [
  		"Password must be at least 8 characters long"
	]
}
```

#### `Passwords-Don't-Match-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "VALIDATION",
	"message": "Passwords must match",
	"errors": [
  		"Passwords must match"
	]
}
```

#### `Email-Not-Valid-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "VALIDATION",
	"message": "email must be a valid email",
	"errors": [
	  "email must be a valid email"
	]
}
```

</details>

<div id="update-user-details"></div>
<details><summary>Update user details</summary>

[Back to top](#top)

```
PUT /users/details
```

### Headers:

| Name          | Type     | Description                   |
| ------------- | -------- | ----------------------------- |
| authorization | `String` | Firebase authorization token. |

### Header example:

```json
{ "Authorization": "98234rnf082hihiefnh8024ng42ieoh9f2h8h2rh0h8" }
```

### Parameters - `Request Body`

| Name     | Type     | Description             |
| -------- | -------- | ----------------------- |
| bio      | `String` | Optional user bio.      |
| website  | `String` | Optional user website.  |
| location | `String` | Optional user location. |

### Parameter examples:

```json
{
  "bio": "Hello, nice to meet you, I'm user.",
  "website": "https://user.com",
  "location": "St. Louis, MO, USA"
}
```

```json
{
  "bio": "",
  "website": ""
}
```

### Success response - `200 OK`:

| Name    | Type     | Description          |
| ------- | -------- | -------------------- |
| message | `String` | User details updated |

### Error responses:

#### `400 BAD REQUEST`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `No-User-Details-Sent-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "NETWORK",
	"message": "Request must include at lease one of: bio, location, or website."
}
```

#### `Invalid-Website-URL-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "VALIDATION",
	"message": "website must be a valid URL",
	"errors": [
  		"website must be a valid URL"
	]
}
```

#### `401 UNAUTHORIZED`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Expired-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/id-token-expired"
    ]
}
```

#### `Invalid-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/argument-error"
    ]
}
```

#### `403 FORBIDDEN`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `No-Token-Error-Response:`

```json
HTTP/1.1 403 FORBIDDEN
{
    "error_type": "AUTHORIZATION",
    "message": "Unauthorized. Please provide a token."
}
```

</details>

---

# **Screams**

<div id="delete-a-like-from-a-scream"></div>
<details><summary>Delete a like from a Scream</summary>

[Back to top](#top)

```
DELETE /screams/:screamId/unlike
```

### Headers:

| Name          | Type     | Description                   |
| ------------- | -------- | ----------------------------- |
| authorization | `String` | Firebase authorization token. |

### Header example:

```json
{ "Authorization": "98234rnf082hihiefnh8024ng42ieoh9f2h8h2rh0h8" }
```

### Parameters - `Query String Param`

| Name     | Type     | Description         |
| -------- | -------- | ------------------- |
| screamId | `String` | Scream's unique ID. |

### Success response - `200 OK`:

| Name         | Type     | Description                    |
| ------------ | -------- | ------------------------------ |
| userHandle   | `String` | User's unique handle.          |
| screamId     | `String` | Scream's unique ID.            |
| createdAt    | `String` | ISO String of like's creation. |
| body         | `String` | Body/content of scream.        |
| userImage    | `String` | User's profile image URL.      |
| likeCount    | `Number` | Number of likes on scream.     |
| commentCount | `Number` | Number of comments on scream.  |

### Success response example:

```json
HTTP/1.1 200 OK
{
	"userHandle": "user",
	"screamId": "DThsMg42rhXvw9i5WJvj",
	"createdAt": "2021-03-09T20:58:04.154Z",
	"body": "This is my super cool comment!",
	"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7273339.jpg?alt=media",
	"likeCount": 23,
	"commentCount": 3
}
```

### Error responses:

#### `404 NOT FOUND`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Scream-Not-Found-Error-Response:`

```json
HTTP/1.1 404 NOT FOUND
{
	"error_type": "NETWORK",
	"message": "Scream not found."
}
```

#### Error response - `400 BAD REQUEST`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Scream-Not-Liked-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "NETWORK",
	"message": "Scream not yet liked. Cannot unlike."
}
```

#### `401 UNAUTHORIZED`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Expired-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/id-token-expired"
    ]
}
```

#### `Invalid-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/argument-error"
    ]
}
```

#### `403 FORBIDDEN`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `No-Token-Error-Response:`

```json
HTTP/1.1 403 FORBIDDEN
{
    "error_type": "AUTHORIZATION",
    "message": "Unauthorized. Please provide a token."
}
```

</details>

<div id="delete-a-scream">
<details><summary>Delete a Scream</summary>

[Back to top](#top)

```
DELETE /screams/:screamId
```

### Headers:

| Name          | Type     | Description                   |
| ------------- | -------- | ----------------------------- |
| authorization | `String` | Firebase authorization token. |

### Header example:

```json
{ "Authorization": "98234rnf082hihiefnh8024ng42ieoh9f2h8h2rh0h8" }
```

### Parameters - `Query String Param`

| Name     | Type     | Description         |
| -------- | -------- | ------------------- |
| screamId | `String` | Scream's unique ID. |

### Success response - `200 OK`:

| Name    | Type     | Description     |
| ------- | -------- | --------------- |
| message | `String` | Scream deleted. |

### Error responses:

#### `404 NOT FOUND`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Scream-Not-Found-Error-Response:`

```json
HTTP/1.1 404 NOT FOUND
{
	"error_type": "NETWORK",
	"message": "Scream not found."
}
```

#### `401 UNAUTHORIZED`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Expired-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/id-token-expired"
    ]
}
```

#### `Invalid-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/argument-error"
    ]
}
```

#### `403 FORBIDDEN`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `No-Token-Error-Response:`

```json
HTTP/1.1 403 FORBIDDEN
{
    "error_type": "AUTHORIZATION",
    "message": "Unauthorized. Please provide a token."
}
```

#### `Not-Scream-Creator-Error-Response:`

```json
HTTP/1.1 403 FORBIDDEN
{
	"error_type": "NETWORK",
	"message": "Unauthorized user. Must be owner of Scream to delete."
}
```

</details>

<div id="get-all-scream-documents"></div>
<details><summary>Get all Scream Documents</summary>

[Back to top](#top)

```
GET /screams
```

### Success response - `200 OK`:

| Name         | Type     | Description                          |
| ------------ | -------- | ------------------------------------ |
| id           | `String` | Unique ID of Scream document         |
| createdAt    | `String` | ISO string of Scream creation.       |
| body         | `String` | Scream body/content.                 |
| userHandle   | `String` | Scream creator's unique user handle. |
| userImage    | `String` | Scream creator's profile image URL.  |
| likeCount    | `Number` | Number of likes the scream has.      |
| commentCount | `Number` | Number of comments the scream has.   |

### Success response example:

```json
HTTP/1.1 200 OK
[
    {
    	"id": "KJHndjhDKJhdnDHjd",
    	"createdAt": "2021-03-06T16:04:36.298Z",
    	"body": "This is a scream!",
    	"userHandle": "exampleuser",
		"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/0293342.png?alt=media",
		"likeCount": 23,
		"commentCount": 4
    },
    {
        "id": "LKJds09gsPIHJDFLugj",
        "createdAt": "2021-03-06T16:04:36.298Z",
        "body": "This is another scream!",
        "userHandle": "user",
		"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/924754.png?alt=media",
		"likeCount": 5,
		"commentCount": 0
    },
]
```

</details>

<div id="get-scream-by-id"></div>
<details><summary>Get scream by ID</summary>

[Back to top](#top)

```
GET /screams/:screamId
```

### Parameters - `Query String Param`

| Name     | Type     | Description         |
| -------- | -------- | ------------------- |
| screamId | `String` | Scream's unique ID. |

### Success response - `200 OK`:

| Name                                           | Type       | Description                           |
| ---------------------------------------------- | ---------- | ------------------------------------- |
| userHandle                                     | `String`   | Scream creator's unique user handle.  |
| body                                           | `String`   | Scream body/content.                  |
| createdAt                                      | `String`   | ISO String of scream creation.        |
| screamId                                       | `String`   | Unique ID of scream.                  |
| **comments**                                   | `Object[]` | List of comments for this scream.     |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;createdAt  | `String`   | ISO String of comment creation.       |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;userHandle | `String`   | User handle of scream creator.        |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;userImage  | `String`   | Profile image URL of comment creator. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;screamId   | `String`   | ID of scream the comment belongs to.  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;body       | `String`   | Comment body/content.                 |

### Success response example:

```json
HTTP/1.1 200 OK
{
	"userHandle": "user",
	"body": "This is my scream!",
	"createdAt": "2021-03-07T23:42:07.990Z",
	"screamId": "DThsMg40sdofjsd8j",
	"comments": [
    	{
      		"createdAt": "2021-03-07T23:45:07.990Z",
      		"userHandle": "otheruser",
			"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7237339.jpg?alt=media",
      		"screamId": "DThsMg40sdofjsd8j",
      		"body": "nice scream, dude!"
    	}
  	]
}
```

### Error responses:

#### Error response - `404 NOT FOUND`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Scream-Not-Found-Error-Response:`

```json
HTTP/1.1 404 NOT FOUND
{
	"error_type": "NETWORK",
	"message": "Scream not found."
}
```

</details>

<div id="post-a-like-on-a-scream"></div>
<details><summary>Post a Like on a Scream</summary>

[Back to top](#top)

```
POST /screams/:screamId/like
```

### Headers:

| Name          | Type     | Description                   |
| ------------- | -------- | ----------------------------- |
| authorization | `String` | Firebase authorization token. |

### Header example:

```json
{ "Authorization": "98234rnf082hihiefnh8024ng42ieoh9f2h8h2rh0h8" }
```

### Parameters - `Query String Param`

| Name     | Type     | Description         |
| -------- | -------- | ------------------- |
| screamId | `String` | Scream's unique ID. |

### Success response - `201 CREATED`:

| Name         | Type     | Description                    |
| ------------ | -------- | ------------------------------ |
| userHandle   | `String` | User's unique handle.          |
| screamId     | `String` | Scream's unique ID.            |
| createdAt    | `String` | ISO String of like's creation. |
| body         | `String` | Body/content of scream.        |
| userImage    | `String` | User's profile image URL.      |
| likeCount    | `Number` | Number of likes on scream.     |
| commentCount | `Number` | Number of comments on scream.  |

### Success response example:

```json
HTTP/1.1 201 CREATED
{
	"userHandle": "user",
	"screamId": "DThsMg42rhXvw9i5WJvj",
	"createdAt": "2021-03-09T20:58:04.154Z",
	"body": "This is my super cool comment!",
	"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7273339.jpg?alt=media",
	"likeCount": 24,
	"commentCount": 3
}
```

### Error responses:

#### `404 NOT FOUND`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Scream-Not-Found-Error-Response:`

```json
HTTP/1.1 404 NOT FOUND
{
	"error_type": "NETWORK",
	"message": "Scream not found."
}
```

#### `400 BAD REQUEST`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Scream-Already-Liked-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "NETWORK",
	"message": "Scream already liked. Cannot like again."
}
```

#### `401 UNAUTHORIZED`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Expired-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/id-token-expired"
    ]
}
```

#### `Invalid-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/argument-error"
    ]
}
```

#### `403 FORBIDDEN`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `No-Token-Error-Response:`

```json
HTTP/1.1 403 FORBIDDEN
{
    "error_type": "AUTHORIZATION",
    "message": "Unauthorized. Please provide a token."
}
```

</details>

<div id="post-new-comment"></div>
<details><summary>Post new comment</summary>

[Back to top](#top)

```
POST /screams/:screamId/comment
```

### Headers:

| Name          | Type     | Description                   |
| ------------- | -------- | ----------------------------- |
| authorization | `String` | Firebase authorization token. |

### Header example:

```json
{ "Authorization": "98234rnf082hihiefnh8024ng42ieoh9f2h8h2rh0h8" }
```

### Parameters - `Query String Param`

| Name     | Type     | Description         |
| -------- | -------- | ------------------- |
| screamId | `String` | Scream's unique ID. |

### Parameters - `Request Body`

| Name | Type     | Description             |
| ---- | -------- | ----------------------- |
| body | `String` | Comment's body/content. |

### Parameters example:

```json
{
  "body": "This is my super cool comment!"
}
```

### Success response - `201 CREATED`:

| Name         | Type     | Description                       |
| ------------ | -------- | --------------------------------- |
| userHandle   | `String` | User's unique handle.             |
| screamId     | `String` | Scream's unique ID.               |
| createdAt    | `String` | ISO String of comment's creation. |
| body         | `String` | Comment's body/content.           |
| userImage    | `String` | User's profile image URL.         |
| likeCount    | `Number` | Number of likes scream has.       |
| commentCount | `Number` | Number of comments scream has.    |

### Success response example:

```json
HTTP/1.1 201 CREATED
{
	"userHandle": "user",
	"screamId": "DThsMg42rhXvw9i5WJvj",
	"createdAt": "2021-03-09T20:58:04.154Z",
	"body": "This is my super cool comment!",
	"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7273339.jpg?alt=media",
	"likeCount": 0,
	"commentCount": 0
}
```

### Error responses:

#### `404 NOT FOUND`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Scream-Not-Found-Error-Response:`

```json
HTTP/1.1 404 NOT FOUND
{
	"error_type": "NETWORK",
	"message": "Scream not found."
}
```

#### `400 BAD REQUEST`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Missing-Fields-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "VALIDATION",
	"message": "body is a required field",
	"errors": [
  		"body is a required field"
	]
}
```

#### `401 UNAUTHORIZED`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Expired-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/id-token-expired"
    ]
}
```

#### `Invalid-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/argument-error"
    ]
}
```

#### `403 FORBIDDEN`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `No-Token-Error-Response:`

```json
HTTP/1.1 403 FORBIDDEN
{
    "error_type": "AUTHORIZATION",
    "message": "Unauthorized. Please provide a token."
}
```

</details>

<div id="post-new-scream-document"></div>
<details><summary>Post new Scream Document</summary>

[Back to top](#top)

```
POST /screams
```

### Headers:

| Name          | Type     | Description                   |
| ------------- | -------- | ----------------------------- |
| authorization | `String` | Firebase authorization token. |

### Header example:

```json
{ "Authorization": "98234rnf082hihiefnh8024ng42ieoh9f2h8h2rh0h8" }
```

### Parameters - `Request Body`

| Name | Type     | Description                    |
| ---- | -------- | ------------------------------ |
| body | `String` | Mandatory Scream body/content. |

### Parameters example:

```json
{
  "body": "This is my scream!"
}
```

### Success response - `201 CREATED`:

| Name         | Type     | Description                        |
| ------------ | -------- | ---------------------------------- |
| userHandle   | `String` | User's unique handle.              |
| createdAt    | `String` | ISO String of scream creation.     |
| body         | `String` | Scream body/content.               |
| likeCount    | `Number` | Number of likes the scream has.    |
| commentCount | `Number` | Number of comments the scream has. |
| userImage    | `String` | User's profile image URL.          |
| screamId     | `String` | Scream's unique ID.                |

### Success response example:

```json
HTTP/1.1 201 CREATED
{
	"userHandle": "user",
	"createdAt": "2021-03-09T20:48:35.498Z",
	"body": "Hi this is my first scream!",
	"likeCount": 0,
	"commentCount": 0,
	"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/757209389.jpg?alt=media",
	"screamId": "S9I7vZBYi9s09fu0n0jd4G"
}
```

### Error responses:

#### `400 BAD REQUEST`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Missing-Required-Fields-Error-Response:`

```json
HTTP/1.1 400 BAD REQUEST
{
	"error_type": "VALIDATION",
	"message": "body is a required field",
	"errors": [
  		"body is a required field"
	]
}
```

#### `401 UNAUTHORIZED`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `Expired-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/id-token-expired"
    ]
}
```

#### `Invalid-Token-Error-Response:`

```json
HTTP/1.1 401 UNAUTHORIZED
{
    "error_type": "AUTHORIZATION",
    "message": "Error while verifying token",
    "errors": [
        "auth/argument-error"
    ]
}
```

#### `403 FORBIDDEN`

| Name       | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| error_type | `String`   | Type of error.                   |
| message    | `String`   | Error message.                   |
| errors     | `String[]` | Optional array of error strings. |

#### `No-Token-Error-Response:`

```json
HTTP/1.1 403 FORBIDDEN
{
    "error_type": "AUTHORIZATION",
    "message": "Unauthorized. Please provide a token."
}
```

</details>
