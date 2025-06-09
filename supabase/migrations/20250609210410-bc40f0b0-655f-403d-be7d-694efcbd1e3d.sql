
-- Crear enum para roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'consumidor');

-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'consumidor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de productos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  image_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  is_on_sale BOOLEAN DEFAULT false,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de carrito de compras
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Políticas para productos
CREATE POLICY "Todos pueden ver productos visibles" ON public.products
  FOR SELECT USING (is_visible = true OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Solo admins pueden insertar productos" ON public.products
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Solo admins pueden actualizar productos" ON public.products
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Solo admins pueden eliminar productos" ON public.products
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- Políticas para carrito
CREATE POLICY "Los usuarios pueden ver su propio carrito" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden agregar a su carrito" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar su carrito" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar de su carrito" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email LIKE '%admin%' THEN 'admin'::user_role
      ELSE 'consumidor'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insertar productos de prueba
INSERT INTO public.products (name, description, price, original_price, category, image_url, is_on_sale, stock) VALUES
('Smartphone Premium', 'El último smartphone con tecnología avanzada y cámara de alta resolución', 899.99, 999.99, 'electrónicos', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', true, 15),
('Laptop Gaming', 'Laptop de alto rendimiento para gaming y trabajo profesional', 1299.99, NULL, 'electrónicos', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', false, 8),
('Camiseta Casual', 'Camiseta cómoda de algodón 100% para uso diario', 29.99, NULL, 'ropa', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', false, 50),
('Auriculares Bluetooth', 'Auriculares inalámbricos con cancelación de ruido premium', 199.99, 249.99, 'electrónicos', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', true, 25),
('Jeans Clásicos', 'Jeans de mezclilla premium con corte clásico', 79.99, 99.99, 'ropa', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', true, 30),
('Smartwatch Deportivo', 'Reloj inteligente con GPS y monitor de actividad física', 249.99, NULL, 'electrónicos', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', false, 12),
('Zapatillas Running', 'Zapatillas deportivas ideales para correr y ejercicio', 89.99, 119.99, 'deportes', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', true, 40),
('Mochila Urbana', 'Mochila resistente perfecta para uso diario y viajes', 59.99, NULL, 'accesorios', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', false, 20);

-- Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Política para el bucket de imágenes
CREATE POLICY "Cualquiera puede ver imágenes de productos" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Solo admins pueden subir imágenes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Solo admins pueden actualizar imágenes" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Solo admins pueden eliminar imágenes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND 
    public.get_user_role(auth.uid()) = 'admin'
  );
