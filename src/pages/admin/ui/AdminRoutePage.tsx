import { redirect } from 'next/navigation';

import { getAdminPermission } from '@app/api-routes/admin/service';

import { getLoginRedirectPath } from '@shared/lib/authRedirect';
import { UnauthorizedError } from '@shared/lib/errors/httpError';

import AdminPage from './AdminPage';

export default async function AdminRoutePage() {
  let canWriteAdmin = false;

  try {
    const permission = await getAdminPermission();
    canWriteAdmin = permission.canWriteAdmin;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(getLoginRedirectPath('/admin'));
    }

    throw error;
  }

  return <AdminPage canWriteAdmin={canWriteAdmin} />;
}
