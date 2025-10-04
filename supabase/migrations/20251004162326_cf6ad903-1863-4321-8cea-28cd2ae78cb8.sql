-- Criar tipo enum para papéis de usuário
CREATE TYPE public.papel_usuario AS ENUM ('admin', 'usuario');

-- Criar tipo enum para status
CREATE TYPE public.status_tipo AS ENUM ('ativo', 'inativo');

-- Tabela de Categorias
CREATE TABLE public.categorias (
  id_categoria UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_categoria TEXT NOT NULL,
  descricao_categoria TEXT,
  status status_tipo NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Itens
CREATE TABLE public.itens (
  id_item UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_item TEXT NOT NULL,
  descricao_item TEXT,
  preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
  id_categoria UUID NOT NULL REFERENCES public.categorias(id_categoria) ON DELETE CASCADE,
  status status_tipo NOT NULL DEFAULT 'ativo',
  data_cadastro TIMESTAMPTZ NOT NULL DEFAULT now(),
  imagem_url TEXT
);

-- Tabela de Usuários (perfis)
CREATE TABLE public.usuarios (
  id_usuario UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  papel papel_usuario NOT NULL DEFAULT 'usuario',
  data_cadastro TIMESTAMPTZ NOT NULL DEFAULT now(),
  status status_tipo NOT NULL DEFAULT 'ativo'
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Categorias (público pode ver, apenas admin pode modificar)
CREATE POLICY "Qualquer pessoa pode visualizar categorias ativas"
  ON public.categorias FOR SELECT
  USING (status = 'ativo');

CREATE POLICY "Apenas admins podem inserir categorias"
  ON public.categorias FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario = auth.uid() AND papel = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem atualizar categorias"
  ON public.categorias FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario = auth.uid() AND papel = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem deletar categorias"
  ON public.categorias FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario = auth.uid() AND papel = 'admin'
    )
  );

-- Políticas RLS para Itens (público pode ver, apenas admin pode modificar)
CREATE POLICY "Qualquer pessoa pode visualizar itens ativos"
  ON public.itens FOR SELECT
  USING (status = 'ativo');

CREATE POLICY "Apenas admins podem inserir itens"
  ON public.itens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario = auth.uid() AND papel = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem atualizar itens"
  ON public.itens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario = auth.uid() AND papel = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem deletar itens"
  ON public.itens FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario = auth.uid() AND papel = 'admin'
    )
  );

-- Políticas RLS para Usuários
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.usuarios FOR SELECT
  USING (auth.uid() = id_usuario);

CREATE POLICY "Admins podem ver todos os perfis"
  ON public.usuarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario = auth.uid() AND papel = 'admin'
    )
  );

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.usuarios FOR UPDATE
  USING (auth.uid() = id_usuario)
  WITH CHECK (auth.uid() = id_usuario);

-- Função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id_usuario, nome, email, papel, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', 'Usuário'),
    new.email,
    'usuario',
    'ativo'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar perfil automaticamente ao registrar
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir algumas categorias de exemplo
INSERT INTO public.categorias (nome_categoria, descricao_categoria, status) VALUES
  ('Lanches', 'Hambúrgueres, sanduíches e afins', 'ativo'),
  ('Pizzas', 'Pizzas variadas', 'ativo'),
  ('Bebidas', 'Refrigerantes, sucos e mais', 'ativo'),
  ('Acompanhamentos', 'Batatas, onion rings e outros', 'ativo');

-- Criar índices para melhor performance
CREATE INDEX idx_itens_categoria ON public.itens(id_categoria);
CREATE INDEX idx_itens_status ON public.itens(status);
CREATE INDEX idx_categorias_status ON public.categorias(status);