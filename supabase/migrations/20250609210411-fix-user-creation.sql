-- Agregar política faltante para permitir insertar perfiles
CREATE POLICY "Permitir insertar perfil en trigger" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Mejorar la función handle_new_user para manejar errores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
  user_role user_role;
BEGIN
  -- Extraer el nombre completo de los metadatos del usuario
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'fullName',
    split_part(NEW.email, '@', 1)
  );
  
  -- Determinar el rol del usuario
  user_role := CASE 
    WHEN NEW.email LIKE '%admin%' THEN 'admin'::user_role
    ELSE 'consumidor'::user_role
  END;

  -- Insertar el perfil del usuario
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_role,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Si hay un error, registrarlo pero no fallar la creación del usuario
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar y recrear el trigger para asegurar que use la nueva función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función auxiliar para crear perfiles manualmente si es necesario
CREATE OR REPLACE FUNCTION public.create_profile_if_missing(user_id UUID, user_email TEXT, user_full_name TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Verificar si el perfil ya existe
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
      user_id,
      user_email,
      COALESCE(user_full_name, split_part(user_email, '@', 1)),
      'consumidor'::user_role,
      NOW(),
      NOW()
    );
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 