import { auth } from '../auth';

export default async function UserAvatar() {
  const session = await auth();

  if (!session || !session.user || !session.user.image) return null;

  return (
    <div>
      <img src={session.user.image} alt='User Avatar' />
    </div>
  );
}
