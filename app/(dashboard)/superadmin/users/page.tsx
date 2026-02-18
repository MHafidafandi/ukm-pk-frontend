import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getUsersQueryOptions } from "@/features/users/api/get-user";
import { UsersList } from "@/features/users/components/users-list";

const UserManagementPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    getUsersQueryOptions({
      Page: 1,
      Limit: 5,
      Search: "",
      Status: "",
      DivisionID: "",
    }),
  );

  const dehydratedState = dehydrate(queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <UsersList />
    </HydrationBoundary>
  );
};

export default UserManagementPage;
