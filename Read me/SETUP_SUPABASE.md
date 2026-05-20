# Configuration Supabase

## Étapes pour créer les tables

### 1. Aller sur Supabase
Rendez-vous sur: https://app.supabase.com

### 2. Créer les 2 tables nécessaires

#### Table 1: `taches`
Exécutez cette requête SQL dans l'onglet SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS taches (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE taches ENABLE ROW LEVEL SECURITY;

-- Permettre à tout le monde de lire et ajouter des tâches
CREATE POLICY "Allow insert taches" ON taches FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow select taches" ON taches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update taches" ON taches FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow delete taches" ON taches FOR DELETE TO anon, authenticated USING (true);
```

#### Table 2: `evenements`
Exécutez cette requête SQL:

```sql
CREATE TABLE IF NOT EXISTS evenements (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nom TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;

-- Permettre à tout le monde de lire et ajouter des événements
CREATE POLICY "Allow insert evenements" ON evenements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow select evenements" ON evenements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update evenements" ON evenements FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow delete evenements" ON evenements FOR DELETE TO anon, authenticated USING (true);
```

### 3. Vérifier la configuration
- Les 2 tables `taches` et `evenements` doivent être créées
- Les politiques RLS (Row Level Security) doivent être actives
- Les données seront maintenant sauvegardées et persistantes!

## Utilisation
- Les tâches et événements sont maintenant stockés dans Supabase
- Au rechargement de la page, vos données restent visibles
- Vous pouvez ajouter, modifier et supprimer des tâches/événements en temps réel
