import { useGetUsersQuery, useCreateUserMutation } from "../lib/api/api";

export default function UserList() {
  const { data, error, isLoading } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {data?.data.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <button
        onClick={() =>
          createUser({
            name: "New User",
            email: "newuser@example.com",
            role: "user",
          })
        }
      >
        Add User
      </button>
    </div>
  );
}
