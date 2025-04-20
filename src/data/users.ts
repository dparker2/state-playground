import { Store, createStore } from "../store.ts";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type UsersResponse = {
  users: User[];
  total: number;
  skip: number;
  limit: number;
};

const isUsersResponse = (body: unknown): body is UsersResponse => {
  return (
    typeof body === "object" &&
    body !== null &&
    "users" in body &&
    Array.isArray(body.users) &&
    "total" in body
  );
};

export type UsersState = {
  users: User[];
  isPending: boolean;
  activeUser: User | null;
};
class Users implements Store<UsersState> {
  private data: UsersResponse | null = null;
  private activeUser: User | null = null;
  private pending = true;

  getState() {
    return {
      users: this.data?.users || [],
      isPending: this.pending,
      activeUser: this.activeUser,
    };
  }

  async fetch() {
    console.log("Fetching!!");
    const res = await fetch("https://dummyjson.com/users");
    const body = await res.json();
    if (isUsersResponse(body)) {
      this.data = body;
    } else {
      console.error("Unexpected body!", this.data);
    }
    this.pending = false;
  }

  select(id: number) {
    for (let i = 0; i < (this.data?.users.length || 0); i++) {
      if (this.data?.users[i].id === id) {
        this.activeUser = this.data?.users[i];
        return;
      }
    }
  }
}

export const [useUserStore, userStore] = createStore(new Users());
