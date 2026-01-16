interface UserContext {
  userId: string;
  deviceId?: string;
  likeStatus?: string;
}

interface OptionalUserContext {
  userId: string | null;
  likeStatus?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserContext | OptionalUserContext;
    }
  }
}

export { UserContext, OptionalUserContext };
