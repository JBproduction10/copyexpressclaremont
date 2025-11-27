# Task: Prevent new registered users from having admin role and block non-admin users from admin page

## Completed Steps
- [x] Updated `app/api/auth/register/route.ts` to set default role to "viewer" instead of "admin" for new users
- [x] Modified `app/admin/layout.tsx` to add authentication and role-based access control, redirecting non-admin users to home page

## Next Steps
- [ ] Test user registration to confirm new users are assigned "viewer" role
- [ ] Test admin page access with a non-admin user to ensure they are blocked and redirected
- [ ] Verify that existing admin users can still access admin pages
