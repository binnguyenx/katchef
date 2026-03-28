import { useAuthStore } from '../store/authStore';

/** Tránh ghi state sau khi user đã đăng xuất / đổi tài khoản. */
export const isAuthUserStill = (userId: string) => useAuthStore.getState().user?.uid === userId;
