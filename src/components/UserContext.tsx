import ViewModel from "../viewmodel.ts";
import data from "./UserContext.json" with { type: "json" };

type User = {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  email: string;
  username: string;
  image: string;
  role: string;
};
class UserContext extends ViewModel<User>() {
  static ctx = UserContext.createContext();

  fullname() {
    const { firstName, lastName } = this.getState();
    return `${firstName} ${lastName}`;
  }
}

function Avatar() {
  const vm = UserContext.ctx.useContext();
  const { image } = vm.getState();
  return (
    <div style={{ border: "2px solid darkgreen" }}>
      <h6>Avatar (Consumer 1)</h6>
      <img src={image} />
    </div>
  );
}

function Personal() {
  const vm = UserContext.ctx.useContext();
  const { age, gender } = vm.getState();

  return (
    <div style={{ border: "2px solid darkgreen" }}>
      <h6>Personal (Consumer 2)</h6>
      <div className="grid" style={{ gridTemplateColumns: "100px 1fr" }}>
        <div>
          <p>Name:</p>
          <p>Age:</p>
          <p>Gender:</p>
        </div>
        <div>
          <p>{vm.fullname()}</p>
          <p>{age}</p>
          <p>{gender}</p>
        </div>
      </div>
    </div>
  );
}

function Account() {
  const vm = UserContext.ctx.useContext();
  const { email, username, role } = vm.getState();

  return (
    <div style={{ border: "2px solid darkgreen" }}>
      <h6>Account (Consumer 3)</h6>
      <div className="grid" style={{ gridTemplateColumns: "100px 1fr" }}>
        <div>
          <p>Email:</p>
          <p>Username:</p>
          <p>Role:</p>
        </div>
        <div>
          <p>{email}</p>
          <p>{username}</p>
          <p>{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function () {
  return (
    <article id="user-context">
      <header>
        <h4>User Context</h4>
      </header>
      <UserContext.ctx.Provider initialState={data}>
        <div style={{ border: "2px solid darkgreen" }}>
          <h5>Provider</h5>
          <div
            className="grid"
            style={{ gridTemplateColumns: "150px 1fr 1fr" }}
          >
            <Avatar />
            <Personal />
            <Account />
          </div>
        </div>
      </UserContext.ctx.Provider>
    </article>
  );
}
