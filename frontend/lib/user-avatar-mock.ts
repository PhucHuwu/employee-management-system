export const getUserAvatarUrlMock = (input: {
  id?: string | null;
  email?: string | null;
  fullName?: string | null;
}): string => {
  const seed = input.id || input.email || input.fullName || 'user';
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
};
