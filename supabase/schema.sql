-- =============================================
-- 不動産管理アプリ：物件テーブルの作成
-- Supabase ダッシュボードの SQL エディタで実行してください
-- =============================================

-- 物件テーブルを作成
CREATE TABLE properties (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        text        NOT NULL,
  rent        integer     NOT NULL CHECK (rent > 0),
  area        text        NOT NULL,
  floor_plan  text        NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- Row Level Security を有効化（これにより全操作にポリシーが必要になる）
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 自分が登録した物件のみ参照できるポリシー
CREATE POLICY "自分の物件のみ参照" ON properties
  FOR SELECT
  USING (auth.uid() = user_id);

-- 自分の user_id で物件を登録できるポリシー（他人のIDでは登録不可）
CREATE POLICY "自分の物件を登録" ON properties
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分が登録した物件のみ更新できるポリシー
CREATE POLICY "自分の物件のみ更新" ON properties
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 自分が登録した物件のみ削除できるポリシー
CREATE POLICY "自分の物件のみ削除" ON properties
  FOR DELETE
  USING (auth.uid() = user_id);
