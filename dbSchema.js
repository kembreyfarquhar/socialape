// DATABASE SCHEMA FOR EACH COLLECTION
let db = {
  users: [
    {
      userId: "dhh2094rnhfh029nef929e",
      email: "user@email.com",
      handle: "user",
      createdAt: "2019-03-15T11:46:01.018Z",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/4120938495.jpg?alt=media&token=lasjdflkjsdlfkjasldkjfs",
      bio?: "Hello, my name is user, nice to meet you.",
      website?: "https://user.com",
      location?: "St. Louis, MO, USA",
    },
  ],
  screams: [
    {
      userHandle: "user",
      body: "this is the scream body",
      createdAt: "2019-03-15T11:46:01.018Z",
      userImage: "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/4120938495.jpg?alt=media&token=lasjdflkjsdlfkjasldkjfs",
      likeCount: 2,
      commentCount: 5,
    },
  ],
  comments: [
    {
      userHandle: "user",
      screamId: "oiajwlkfnaodiolsdng",
      body: "nice one, mate!",
      createdAt: "2019-03-15T11:46:01.018Z",
      userImage: "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/4120938495.jpg?alt=media&token=lasjdflkjsdlfkjasldkjfs",
    },
  ],
  likes: [
    {
      screamId: "liasdjlfsjdlk",
      userHandle: "user"
    }
  ],
  notifications: [
    {
      recipient: "user",
      sender: "john",
      read: "true | false",
      screamId: "oiasdofijasddfj",
      type: "like | comment",
      createdAt: "2019-03-15T11:46:01.018Z",
    },
  ],
};

// UNAUTHENTICATED USER RESPONSE SCHEMA
const unauthenticatedUser = {
  user: {
    bio?: "hello it's me",
    website?: "http://itme.com",
    location?: "",
    createdAt: "2021-03-16T04:18:54.228Z",
    handle: "user",
    userId: "oiaasjdffiljasldkfjaslkdjfs",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/4120938495.jpg?alt=media&token=lasjdflkjsdlfkjasldkjfs",
    email: "itme@gmail.com"
  },
  screams: [
    {
      commentCount: 0,
      likeCount: 0,
      body: "this is a scream",
      userImage: "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/4120938495.jpg?alt=media&token=lasjdflkjsdlfkjasldkjfs",
      createdAt: "2021-03-16T03:31:39.816Z",
      userHandle: "user",
      screamId: "apasdflkajsldkflsdk"
    }
  ]
}

// AUTHENTICATED USER RESPONSE SCHEMA 
const userData = {
  // Redux
  credentials: {
    userId: "LKDFJLAJBHAOAFI0830N30NF0E9N",
    email: "user@email.com",
    handle: "user",
    createdAt: "2019-03-15T11:46:01.018Z",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/4120938495.jpg?alt=media&token=lasjdflkjsdlfkjasldkjfs",
    bio?: "Hello, my name is user, nice to meet you.",
    website?: "https://user.com",
    location?: "St. Louis, MO, USA",
  },
  likes: [
    {
      userHandle: "user",
      screamId: "hfdoj2093nq0ddh0329j23",
    },
    {
      userHandle: "user",
      screamId: "0293n0ei9nc0293r2efnp09",
    },
  ],
  notifications: [
    {
      read: 'true | false',
      createdAt: "2021-03-11T12:06:20.194Z",
      sender: 'itme',
      recipient: 'user',
      screamId: "lsjlfkjaslkdjflksdj",
      type: "comment | like",
      notificationId: "oaijsdolijasdfjj"
    }
  ]
};
