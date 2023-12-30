# Documentation

Development URI: http://localhost:3000/api

Production URI: `None`

## Authentication

This is mostly handled on the frontend. However, you will need to create a user's profile during the registration process. Check next section for endpoint to create a new profile.

To authenticate user with the backend, set header:

```ts
{ "Authorization": "Bearer <token>" }
```

## Users

This section contains all endpoints to deal with user related CRUD operations.

### Shared Types

```ts
export enum UserRole {
  USER = 'user',
  BUSINESS = 'business',
  ADMIN = 'admin'
}

export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  gender: UserGender;
  dateOfBirth: Date;
  phoneNumber: string;
  impairments: string[];
  city: string;
  state: string;
  address: string;
  bio: string;
  profilePictureUrl: string;
  role: UserRole;
  premium: boolean;
}
```

### Shared Error Response

Status `401` - User is not authenticated

```ts
{ "message": string }
```

### Endpoints

#### `GET /user/profile`

Get profile of the **authenticated** user.

##### Responses

Status `200` - Found a profile

```ts
{ "profile": UserProfile }
```

Status `404` - Profile not found

```ts
{ "message": string }
```

#### `POST /user/profile`

Create a new profile for the **authenticated** user. If user already has a profile, it will replace the existing profile.

##### Request Body

Content-Type: `multipart/form-data;`

###### Example Request

For user role and user gender, please use the `UserRole` and `UserGender` enum respectively.

Avatar / profile picture cannot be greater than 5MiB.

Form field name must be the same as the following keys:

```yaml
firstName: William
lastName: Law
gender: male
dateOfBirth: 2003-01-30
phoneNumber: <phone_number_here>
impairments: ['OCD']
city: Bandar Sunway
state: Selangor
address: Petaling Jaya
bio: I like to code
role: user
premium: false
avatar: <an_image_lte_5mib>
```

##### Responses

Status `201` - Profile created

```ts
{
  "message": string,
  "user": UserRecord & UserProfile
}
```

#### `GET /users/:token?`

Get a list of users. The listed is paginated in batches of 10 users per query.

##### Parameters

`:token?` - Optional parameter. Token is used to determine the next batch of results. Use the `nextPageToken` returned in the response. Default: `undefined`.

##### Responses

Status `200` - Successful request

```ts
{
  "users": (UserRecord & UserProfile)[]
  "nextPageToken": string | undefined
}
```

#### `GET /user/:id`

Get a specific user by their ID.

##### Parameters

`:id` - Required parameter. The ID of the user.

##### Responses

Status `200` - Successful request

```ts
{ "user": UserRecord & UserProfile }
```

Status `404`- User not found

```ts
{ "message": string }
```
