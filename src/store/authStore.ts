import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import { db } from '../db';
import { verifyPassword } from '../utils/auth';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          // Buscar usuario en la base de datos
          const user = await db.users
            .where('username')
            .equals(username)
            .first();

          if (!user) {
            console.log('Usuario no encontrado');
            return false;
          }

          // Verificar contraseña
          const isValid = await verifyPassword(password, user.passwordHash);

          if (!isValid) {
            console.log('Contraseña incorrecta');
            return false;
          }

          // Login exitoso
          set({
            currentUser: user,
            isAuthenticated: true,
          });

          console.log('✅ Login exitoso:', user.username);
          return true;
        } catch (error) {
          console.error('❌ Error en login:', error);
          return false;
        }
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
        });
        console.log('✅ Sesión cerrada');
      },

      hasRole: (role: UserRole) => {
        const { currentUser } = get();
        return currentUser?.role === role;
      },
    }),
    {
      name: 'panaderia-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
