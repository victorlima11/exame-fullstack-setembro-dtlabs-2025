import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_BASE}/users/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (userData.email) {
              setUser(userData);
            }
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            setUser(null);
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setUser(null);
        }
      }
      setLoading(false);
    };
    validateToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        const userData = {
          id: data.id,
          name: data.name,
          email: email
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${data.name}!`,
        });
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Erro ao fazer login' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão. Tente novamente.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        toast({
          title: "Conta criada com sucesso!",
          description: `Bem-vindo, ${data.user.name}!`,
        });
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Erro ao criar conta' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão. Tente novamente.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};