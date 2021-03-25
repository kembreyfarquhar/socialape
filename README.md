# Social Ape

This project is a full-featured social media application. Users may sign up with email and password, post "screams", like and comment on screams, update their profile information and photo, and receive notifications when other users have like or commented on one of their screams.

> For this project I used **TypeScript** and **Firebase cloud functions**

## Endpoints

| Endpoint                           | Explanation                             |
| ---------------------------------- | --------------------------------------- |
| POST /users/register               | Register a new user.                    |
| POST /users/login                  | User Login.                             |
| GET /users/handle/:handle          | Get any user by their handle.           |
| GET /users/logged-in-user          | Get information for a logged in user.   |
| POST /users/image                  | Upload/post an image for user profile.  |
| PUT /users/details                 | Update user details.                    |
| PUT /users/mark-notifications-read | Marks all unread notifications as read. |
| GET /screams                       | Get all screams                         |
| GET /screams/:screamId             | Get scream by ID.                       |
| POST /screams                      | Post a new scream.                      |
| POST /screams/:screamId/comment    | Post a comment on a scream.             |
| POST /screams/:screamId/like       | Like a scream.                          |
| DELETE /screams/:screamId/unlike   | Unlike a scream.                        |
| DELETE /screams/:screamId          | Delete a scream.                        |

---

## Documentation:

See [DOCUMENTATION.md](DOCUMENTATION.md)

---

## Database Triggers

- [**createNotificationsOnLike**](https://github.com/kembreyfarquhar/socialape/blob/5790120c7f08dab21625c28b58fb2cc9642336ec/functions/src/index.ts#L29-L55):

  - Triggered when a Like document is created in the database.
    1. Creates a new Notification document using snapshot data and data from Scream document.
    2. Sets this Notification into the database.

- [**deleteNotificationOnUnlike**](https://github.com/kembreyfarquhar/socialape/blob/5790120c7f08dab21625c28b58fb2cc9642336ec/functions/src/index.ts#L58-L70):

  - Triggered when a Like document gets deleted.
    1. Uses snapshot data to find Notification associated with the Like.
    2. Deletes the Notification document.

- [**createNotificationOnComment**](https://github.com/kembreyfarquhar/socialape/blob/5790120c7f08dab21625c28b58fb2cc9642336ec/functions/src/index.ts#L73-L101):

  - Triggered when a Comment is created in the database.
    1. Creates a new Notification document using snapshot data and data from Scream document.
    2. Sets this Notification into the database.

- [**onUserChangeImage**](https://github.com/kembreyfarquhar/socialape/blob/5790120c7f08dab21625c28b58fb2cc9642336ec/functions/src/index.ts#L104-L138):

  - Triggered when user updates their profile Image.
    1. Captures "Before" and "After" change data of User document.
    2. Finds and loops through both Scream documents and Comment documents that share the same user handle as the User document that has changed.
    3. Updates the Scream and Comment documents to have the new (After) user image URL.
    4. Commits the changes.

- [**onScreamDelete**](https://github.com/kembreyfarquhar/socialape/blob/5790120c7f08dab21625c28b58fb2cc9642336ec/functions/src/index.ts#L141-L177):
  - Triggered when a Scream document is deleted.
    1. Finds and loops through Comment, Like, and Notification documents that share the same screamId as the Scream document that has been deleted.
    2. Deletes each document found.
    3. Commits the changes.

---

Created by [Katie Embrey-Farquhar](https://github.com/kembreyfarquhar) - 2021.
