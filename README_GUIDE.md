# 📋 Guide de mise en place - Tâches et Événements avec Supabase

## ✅ Étape 1: Configuration Supabase

### Créer les tables dans Supabase:

1. Allez sur https://app.supabase.com
2. Selectionnez votre projet
3. Allez dans **SQL Editor**
4. Exécutez ces deux requêtes SQL:

#### Table "taches":
```sql
CREATE TABLE IF NOT EXISTS taches (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE taches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert taches" ON taches FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow select taches" ON taches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update taches" ON taches FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow delete taches" ON taches FOR DELETE TO anon, authenticated USING (true);
```

#### Table "evenements":
```sql
CREATE TABLE IF NOT EXISTS evenements (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nom TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert evenements" ON evenements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow select evenements" ON evenements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update evenements" ON evenements FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow delete evenements" ON evenements FOR DELETE TO anon, authenticated USING (true);
```

## ✅ Étape 2: Lancer un serveur local

Vous DEVEZ utiliser un serveur HTTP (les modules ES6 ne fonctionnent pas en local sans serveur).

### Option 1: Avec Node.js et http-server
```bash
npm install -g http-server
http-server .
```
Puis ouvrez: `http://localhost:8080`

### Option 2: Avec Python
```bash
python -m http.server 8000
```
Puis ouvrez: `http://localhost:8000`

### Option 3: Avec VS Code Live Server
1. Installez l'extension "Live Server"
2. Cliquez droit sur `index.html`
3. Sélectionnez "Open with Live Server"

## ✅ Étape 3: Utilisation

- **Ajouter une tâche**: Tapez dans le champ "Ajouter une tâche..." et cliquez "Ajouter"
- **Marquer comme faite**: Cliquez le bouton "OK" à côté d'une tâche
- **Supprimer une tâche**: Cliquez "Supprimer"
- **Ajouter un événement**: Cliquez le bouton "+" dans la section "Événements à venir"
- **Supprimer un événement**: Cliquez l'icône poubelle

## 📊 Comment ça marche?

1. Les données sont sauvegardées en temps réel dans Supabase
2. Quand vous rechargez la page, les données sont rechargées automatiquement
3. Les modifications sont synchronisées instantanément avec la base de données

## 🐛 Dépannage

### Message d'erreur CORS
- Assurez-vous d'utiliser un serveur HTTP (http-server, python, Live Server, etc.)
- Les modules ES6 ne fonctionnent qu'avec HTTP(S)

### Les données ne se sauvegardent pas
- Vérifiez que les tables sont créées dans Supabase
- Ouvrez la console (F12) pour voir les messages d'erreur
- Vérifiez les RLS policies sont correctes

### Les données ne se chargent pas
- Vérifiez votre connexion internet
- Vérifiez que supabase.js a les bonnes clés d'accès
- Ouvrez la console (F12) > Onglet Network pour voir les requêtes
