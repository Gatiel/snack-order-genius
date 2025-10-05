-- Criar enum para os papéis do sistema
CREATE TYPE public.app_role AS ENUM ('admin', 'gerente', 'funcionario', 'cliente');

-- Criar tabela de roles (separada para segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Criar função security definer para verificar roles (evita recursão de RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Criar função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Usuários podem ver seus próprios roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os roles"
  ON public.user_roles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem inserir roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem deletar roles"
  ON public.user_roles
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Função para atribuir role de cliente automaticamente ao novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atribuir role de cliente por padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'cliente');
  RETURN new;
END;
$$;

-- Trigger para atribuir role automaticamente
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Atualizar políticas RLS de categorias para usar a nova estrutura de roles
DROP POLICY IF EXISTS "Apenas admins podem inserir categorias" ON public.categorias;
DROP POLICY IF EXISTS "Apenas admins podem atualizar categorias" ON public.categorias;
DROP POLICY IF EXISTS "Apenas admins podem deletar categorias" ON public.categorias;

CREATE POLICY "Admins e gerentes podem inserir categorias"
  ON public.categorias
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'gerente')
  );

CREATE POLICY "Admins e gerentes podem atualizar categorias"
  ON public.categorias
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'gerente')
  );

CREATE POLICY "Admins e gerentes podem deletar categorias"
  ON public.categorias
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'gerente')
  );

-- Atualizar políticas RLS de itens para usar a nova estrutura de roles
DROP POLICY IF EXISTS "Apenas admins podem inserir itens" ON public.itens;
DROP POLICY IF EXISTS "Apenas admins podem atualizar itens" ON public.itens;
DROP POLICY IF EXISTS "Apenas admins podem deletar itens" ON public.itens;

CREATE POLICY "Admins e gerentes podem inserir itens"
  ON public.itens
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'gerente')
  );

CREATE POLICY "Admins e gerentes podem atualizar itens"
  ON public.itens
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'gerente')
  );

CREATE POLICY "Admins e gerentes podem deletar itens"
  ON public.itens
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'gerente')
  );

-- Criar índice para melhor performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);