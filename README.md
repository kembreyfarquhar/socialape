# Social Ape

This project is a full-featured social media application. Users may sign up with email and password, post "screams", like and comment on screams, update their profile information and photo, and receive notifications when other users have like or commented on one of their screams. 

> For this project I used **TypeScript** and **Firebase cloud functions**

## Endpoints

| Endpoint | Explanation |
|----------|-------------|
| POST /users/register | Register a new user. |
| POST /users/login | User Login. |
| GET /users/handle/:handle | Get any user by their handle. |
| GET /users/logged-in-user | Get information for a logged in user.
| POST /users/image | Upload/post an image for user profile. |
| PUT /users/details | Update user details. |
| PUT /users/mark-notifications-read | Marks all unread notifications as read. |
| GET /screams | Get all screams |
| GET /screams/:screamId | Get scream by ID. |
| POST /screams | Post a new scream. |
| POST /screams/:screamId/comment | Post a comment on a scream. |
| POST /screams/:screamId/like | Like a scream. |
| DELETE /screams/:screamId/unlike | Unlike a scream. |
| DELETE /screams/:screamId | Delete a scream. |

---

Documentation coming soon. 🥳 

Created by [Katie Embrey-Farquhar](https://github.com/kembreyfarquhar).