
-- messagesテーブルにis_understood列を追加
ALTER TABLE public.messages
ADD COLUMN is_understood BOOLEAN DEFAULT false;

-- 既存のRLSポリシーを更新して新しい列を含める必要があるか確認
-- 今回はis_understood列に対する直接的なアクセス制限は不要と判断し、既存ポリシーの変更は行いません。
-- ユーザーは自身の会話内のメッセージを更新できるポリシーが既にあるため、
-- そのポリシーを通じてis_understoodフラグも更新できるはずです。

-- 念のため、メッセージ更新ポリシーを確認 (これは実行するSQLではありません。確認用です)
-- CREATE POLICY "Users can update their own messages" -- (既存のポリシー名に合わせてください)
--   ON public.messages
--   FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.conversations
--       WHERE conversations.id = messages.conversation_id
--       AND conversations.user_id = auth.uid()
--     )
--   );
--
--   (もし上記のような更新ポリシーがない場合や、特定の列のみ更新を許可している場合は、
--    is_understoodを更新できるようにポリシーの調整が必要になるかもしれません)

