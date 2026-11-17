import supabase from './db-client.js';
import { withApi, HttpError, readBody, notAllowed, check } from './_lib/http.js';
import { authClient, currentUser, ensureProfile, isStaff } from './_lib/auth.js';
import * as v from './_lib/validate.js';

const sessionPayload = (session, user) => ({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
  expires_at: session.expires_at,
  user,
});

async function register(body, res) {
  const fullName = v.text(body.full_name, 'Full name', { min: 2, max: 80 });
  const email = v.email(body.email);
  const phone = v.phone(body.phone);
  const password = v.text(body.password, 'Password', { min: 8, max: 72 });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone },
  });
  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      throw new HttpError(409, 'An account with this email already exists. Please log in.');
    }
    throw error;
  }
  check(
    await supabase
      .from('profiles')
      .upsert({ id: data.user.id, email, full_name: fullName, phone, role: 'customer', is_active: true })
  );

  const signIn = await authClient().auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;
  const profile = await ensureProfile(signIn.data.user);
  return res.status(201).json(sessionPayload(signIn.data.session, profile));
}

async function login(body, res) {
  const email = v.email(body.email);
  const password = v.text(body.password, 'Password', { max: 72 });
  const { data, error } = await authClient().auth.signInWithPassword({ email, password });
  if (error || !data?.session) throw new HttpError(401, 'Incorrect email or password.');

  const profile = await ensureProfile(data.user);
  if (profile.is_active === false) throw new HttpError(403, 'This account has been disabled. Please contact the store.');
  if (body.portal === 'admin' && !isStaff(profile)) {
    throw new HttpError(403, 'This account does not have access to the admin panel.');
  }
  return res.status(200).json(sessionPayload(data.session, profile));
}

async function refresh(body, res) {
  const token = v.text(body.refresh_token, 'Refresh token', { max: 2000 });
  const { data, error } = await authClient().auth.refreshSession({ refresh_token: token });
  if (error || !data?.session) throw new HttpError(401, 'Session expired. Please log in again.');
  const profile = await ensureProfile(data.user);
  return res.status(200).json(sessionPayload(data.session, profile));
}

async function forgot(body, res) {
  const email = v.email(body.email);
  const redirectTo = typeof body.redirect_to === 'string' && /^https?:\/\//.test(body.redirect_to) ? body.redirect_to : undefined;
  const { error } = await authClient().auth.resetPasswordForEmail(email, { redirectTo });
  if (error && /rate|too many/i.test(error.message)) {
    throw new HttpError(429, 'Too many reset requests. Please wait a few minutes and try again.');
  }
  if (error) console.error('Password reset error:', error.message);
  return res.status(200).json({
    message: 'If an account exists for this email, a password reset link has been sent. Please check your inbox and spam folder.',
  });
}

async function resetPassword(body, res) {
  const token = v.text(body.access_token, 'Reset token', { max: 4000 });
  const password = v.text(body.password, 'New password', { min: 8, max: 72 });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) throw new HttpError(400, 'This reset link is invalid or has expired. Please request a new one.');
  const update = await supabase.auth.admin.updateUserById(data.user.id, { password });
  if (update.error) throw update.error;
  return res.status(200).json({ message: 'Password updated. You can now log in with your new password.' });
}

async function changePassword(req, body, res) {
  const user = await currentUser(req);
  const current = v.text(body.current_password, 'Current password', { max: 72 });
  const password = v.text(body.new_password, 'New password', { min: 8, max: 72 });
  const check = await authClient().auth.signInWithPassword({ email: user.email, password: current });
  if (check.error) throw new HttpError(400, 'Current password is incorrect.');
  const update = await supabase.auth.admin.updateUserById(user.id, { password });
  if (update.error) throw update.error;
  return res.status(200).json({ message: 'Password changed successfully.' });
}

async function updateProfile(req, body, res) {
  const user = await currentUser(req);
  const changes = {
    full_name: v.text(body.full_name, 'Full name', { min: 2, max: 80 }),
    phone: v.phone(body.phone, 'Phone number', { required: false }),
    address: v.text(body.address, 'Address', { required: false, max: 300 }),
    city: v.text(body.city, 'City', { required: false, max: 60 }),
    pincode: v.text(body.pincode, 'Pincode', { required: false, max: 6 }),
  };
  if (changes.pincode && !/^\d{6}$/.test(changes.pincode)) throw new HttpError(400, 'Pincode must be 6 digits.');
  const data = check(await supabase.from('profiles').update(changes).eq('id', user.id).select().single());
  return res.status(200).json({ user: data });
}

export default withApi(async (req, res) => {
  const action = req.query.action;
  const body = readBody(req);

  if (action === 'me' && req.method === 'GET') return res.status(200).json({ user: await currentUser(req) });
  if (action === 'me' && req.method === 'PUT') return updateProfile(req, body, res);
  if (req.method !== 'POST') return notAllowed();

  switch (action) {
    case 'register': return register(body, res);
    case 'login': return login(body, res);
    case 'refresh': return refresh(body, res);
    case 'forgot': return forgot(body, res);
    case 'reset': return resetPassword(body, res);
    case 'change-password': return changePassword(req, body, res);
    default: throw new HttpError(404, 'Unknown action');
  }
});
