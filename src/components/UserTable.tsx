import ViewModel from "../viewmodel.ts";

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

type UsersState = {
  users: User[];
  loading: boolean;
  error?: string;
  activeUser: User | null;
};

class Users extends ViewModel<UsersState>() {
  override onMount(): void {
    this.fetch();
  }

  async fetch() {
    this.setState({
      loading: true,
      users: [],
    });

    await new Promise((r) => setTimeout(r, 1000));
    const res = await fetch("https://dummyjson.com/user");
    const body = await res.json();

    this.setState({
      loading: false,
      users: isUsersResponse(body) ? body.users : [],
    });
  }

  onSelectUser(id: number) {
    const user = this.getState().users.find((user) => user.id === id);
    if (user) this.setState({ activeUser: user });
  }
}

const initialState: UsersState = {
  activeUser: null,
  users: [],
  loading: false,
};

export default function () {
  const userModel = Users.useModel(initialState);
  const { users, activeUser, loading } = userModel.getState();

  const body = users.map((user) => (
    <tr
      key={user.id}
      onClick={() => userModel.onSelectUser(user.id)}
    >
      <td>
        <input
          id={`user-${user.id}`}
          type="radio"
          name="user"
          checked={activeUser?.id === user.id}
          onChange={(evt) => {
            if (evt.currentTarget.checked) userModel.onSelectUser(user.id);
          }}
        />
      </td>
      <th scope="row">
        <label htmlFor={`user-${user.id}`}>
          {user.firstName} {user.lastName}
        </label>
      </th>
      <td>
        <label htmlFor={`user-${user.id}`}>{user.email}</label>
      </td>
    </tr>
  ));

  let header = (
    <tr>
      <th scope="col"></th>
      <th scope="col">Full name</th>
      <th scope="col">Email</th>
    </tr>
  );
  if (loading) {
    header = (
      <tr>
        <th scope="col">
          <span aria-busy="true">Loading...</span>
        </th>
      </tr>
    );
  }

  return (
    <article id="fetching-data">
      <header>
        <h4>Fetching Data</h4>
      </header>
      <button type="button" onClick={() => userModel.fetch()}>
        Refresh
      </button>
      <div className="overflow-auto" style={{ height: 400 }}>
        <table className="fixed-header">
          <thead>{header}</thead>
          <tbody>{body}</tbody>
        </table>
      </div>
    </article>
  );
}
