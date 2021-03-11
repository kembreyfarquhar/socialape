let db = {
  users: [
    {
      userId: "dhh2094rnhfh029nef929e",
      email: "user@email.com",
      handle: "user",
      createdAt: "2019-03-15T11:46:01.018Z",
      imageUrl: "image/dsfdsdfsldkjfdskj/lsjdflksnd",
      bio: "Hello, my name is user, nice to meet you.",
      website: "https://user.com",
      location: "St. Louis, MO, USA",
    },
  ],
  screams: [
    {
      userHandle: "user",
      body: "this is the scream body",
      createdAt: "2019-03-15T11:46:01.018Z",
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
    },
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

const userData = {
  // Redux
  credentials: {
    userId: "LKDFJLAJBHAOAFI0830N30NF0E9N",
    email: "user@email.com",
    handle: "user",
    createdAt: "2019-03-15T11:46:01.018Z",
    imageUrl: "image/dsfdsdfsldkjfdskj/lsjdflksnd",
    bio: "Hello, my name is user, nice to meet you.",
    website: "https://user.com",
    location: "St. Louis, MO, USA",
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
};
