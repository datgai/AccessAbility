export interface Chat {
  lastMessage?:string;
  lastMessageDate?:Date;
  userIds: string[],
  users:[
    {
      displayName: string,
      photoURL : string,
    },
    {
      displayName: string,
      photoURL : string,
    }
  ]
}

export interface Message{
  text: string;
  senderId : string;
  sentDate: Date;
}