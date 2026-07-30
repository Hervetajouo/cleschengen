-- ============================================================
-- CléSchengen — schéma Supabase complet
-- À exécuter dans Supabase > SQL Editor, une seule fois.
-- ============================================================

-- ---------- 1. Profils utilisateurs ----------
-- Un profil est créé automatiquement pour chaque nouveau compte (trigger plus bas).
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'chercheur' check (role in ('chercheur', 'bailleur', 'admin')),
  verification_status text not null default 'none' check (verification_status in ('none', 'pending', 'verified', 'rejected')),
  id_document_path text,
  rejection_reason text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Chacun peut lire son propre profil.
create policy "read own profile" on profiles
  for select using (auth.uid() = id);

create policy "insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Volontairement AUCUNE policy "update own profile" générale : role et
-- verification_status ne doivent jamais être modifiables directement par
-- l'utilisateur (sinon il pourrait s'auto-vérifier). Les seules mises à
-- jour possibles pour un utilisateur passent par les fonctions RPC
-- "security definer" ci-dessous, qui appliquent leurs propres règles.

-- Un admin peut tout lire et tout modifier (nécessaire pour le panneau de modération).
create policy "admin read all profiles" on profiles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admin update all profiles" on profiles
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Crée automatiquement une ligne "profiles" à chaque inscription.
-- Le rôle choisi à l'inscription est passé via les "user metadata" (voir le frontend).
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, verification_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'chercheur'),
    case when coalesce(new.raw_user_meta_data->>'role', 'chercheur') = 'bailleur' then 'none' else 'none' end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Un chercheur peut demander à devenir bailleur : passe en attente de vérification.
create function request_bailleur_upgrade()
returns void as $$
begin
  update profiles
  set role = 'bailleur', verification_status = 'none'
  where id = auth.uid() and role = 'chercheur';
end;
$$ language plpgsql security definer;

-- Un bailleur envoie/renvoie sa pièce d'identité (déjà uploadée dans le bucket
-- "id-documents" par le client). Repasse toujours le dossier en attente.
create function submit_id_document(document_path text)
returns void as $$
begin
  update profiles
  set id_document_path = document_path, verification_status = 'pending', rejection_reason = null
  where id = auth.uid() and role = 'bailleur' and verification_status in ('none', 'pending', 'rejected');
end;
$$ language plpgsql security definer;

-- ---------- 2. Annonces ----------
create table listings (
  id text primary key,
  owner_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('maison', 'chambre', 'voiture')),
  transaction text not null check (transaction in ('location', 'vente')),
  country text not null,
  city text not null,
  price numeric not null,
  owner_name text not null,
  phone text not null,
  description text not null,
  photos jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table listings enable row level security;

-- Tout le monde (y compris visiteurs non connectés) peut lire les annonces.
create policy "public read listings" on listings
  for select using (true);

-- Seul un bailleur vérifié peut créer une annonce en son propre nom.
create policy "verified landlords insert" on listings
  for insert with check (
    owner_id = auth.uid()
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'bailleur' and p.verification_status = 'verified'
    )
  );

-- Un bailleur peut modifier/supprimer ses propres annonces ; un admin peut tout modérer.
create policy "owner or admin update listings" on listings
  for update using (
    owner_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "owner or admin delete listings" on listings
  for delete using (
    owner_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ---------- 3. Déblocages (qui a payé pour voir quel contact) ----------
create table unlocks (
  user_id uuid not null references profiles(id) on delete cascade,
  listing_id text not null references listings(id) on delete cascade,
  stripe_session_id text,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table unlocks enable row level security;

-- Chacun ne voit que ses propres déblocages.
create policy "read own unlocks" on unlocks
  for select using (auth.uid() = user_id);

-- Les insertions se font uniquement depuis l'Edge Function du webhook Stripe,
-- qui utilise la clé "service role" et contourne donc RLS. Aucune policy
-- d'insertion n'est donc ouverte au client — c'est volontaire : un utilisateur
-- ne doit jamais pouvoir s'auto-débloquer un contact sans payer.

-- ---------- 4. Stockage des pièces d'identité (privé) ----------
insert into storage.buckets (id, name, public)
values ('id-documents', 'id-documents', false);

-- Un utilisateur peut uploader/lire son propre document (chemin = son user id).
create policy "own id document upload" on storage.objects
  for insert with check (
    bucket_id = 'id-documents' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own id document read" on storage.objects
  for select using (
    bucket_id = 'id-documents' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );

-- ============================================================
-- Pour créer ton premier compte admin :
-- 1. Inscris-toi normalement sur le site (n'importe quel rôle).
-- 2. Dans Supabase > SQL Editor, exécute (remplace l'email) :
--    update profiles set role = 'admin' where email = 'ton-email@exemple.com';
-- ============================================================
