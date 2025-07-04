
-- タグマスターテーブルの作成
CREATE TABLE public.tag_master (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  major_category TEXT NOT NULL,
  minor_category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subject, major_category, minor_category)
);

-- Row Level Security (RLS) を有効化
ALTER TABLE public.tag_master ENABLE ROW LEVEL SECURITY;

-- 管理者のみがタグを操作できるポリシーを作成
CREATE POLICY "Admin users can manage tags" 
  ON public.tag_master 
  FOR ALL 
  USING (public.check_admin_user());

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 更新日時を自動更新するトリガー
CREATE TRIGGER update_tag_master_updated_at
  BEFORE UPDATE ON public.tag_master
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 初期データの挿入
INSERT INTO public.tag_master (subject, major_category, minor_category) VALUES
-- 国語
('国語', '現代文', '評論読解'),
('国語', '現代文', '小説読解'),
('国語', '現代文', '随筆読解'),
('国語', '現代文', '語彙・慣用句'),
('国語', '現代文', '漢字'),
('国語', '古文', '文法'),
('国語', '古文', '単語・常識'),
('国語', '古文', '和歌'),
('国語', '古文', '文学史'),
('国語', '古文', '読解'),
('国語', '漢文', '句法'),
('国語', '漢文', '単語'),
('国語', '漢文', '漢詩'),
('国語', '漢文', '思想'),
('国語', '漢文', '読解'),
('国語', '小論文', '構成・表現'),
('国語', '小論文', '課題文型'),
('国語', '小論文', 'テーマ型'),
('国語', '小論文', 'データ分析型'),

-- 数学
('数学', '数学I・A', '数と式'),
('数学', '数学I・A', '二次関数'),
('数学', '数学I・A', '図形と計量'),
('数学', '数学I・A', 'データの分析'),
('数学', '数学I・A', '場合の数と確率'),
('数学', '数学I・A', '図形の性質'),
('数学', '数学II・B', '様々な式'),
('数学', '数学II・B', '図形と方程式'),
('数学', '数学II・B', '指数・対数関数'),
('数学', '数学II・B', '三角関数'),
('数学', '数学II・B', '微分・積分'),
('数学', '数学II・B', '数列'),
('数学', '数学II・B', 'ベクトル'),
('数学', '数学III', '複素数平面'),
('数学', '数学III', '式と曲線'),
('数学', '数学III', '関数と極限'),
('数学', '数学III', '微分法'),
('数学', '数学III', '積分法'),
('数学', '数学III', '積分法の応用'),

-- 英語
('英語', 'リーディング', '英文解釈'),
('英語', 'リーディング', '内容把握'),
('英語', 'リーディング', '要約'),
('英語', 'リーディング', '速読'),
('英語', 'ライティング', '和文英訳'),
('英語', 'ライティング', '自由英作文'),
('英語', 'ライティング', '要約'),
('英語', 'リスニング', '会話聞き取り'),
('英語', 'リスニング', '講義聞き取り'),
('英語', 'リスニング', '発音・アクセント'),
('英語', '文法・語彙', '文法問題'),
('英語', '文法・語彙', '語法'),
('英語', '文法・語彙', 'イディオム'),
('英語', '文法・語彙', '単語'),

-- 物理
('物理', '力学', '運動と力'),
('物理', '力学', '仕事とエネルギー'),
('物理', '力学', '運動量'),
('物理', '力学', '円運動・単振動'),
('物理', '力学', '万有引力'),
('物理', '熱力学', '熱と温度'),
('物理', '熱力学', '気体の分子運動論'),
('物理', '熱力学', '熱力学第一法則'),
('物理', '波動', '波の性質'),
('物理', '波動', '音波'),
('物理', '波動', '光波-反射・屈折'),
('物理', '波動', '光波-干渉・回折'),
('物理', '電磁気学', '静電気・電場'),
('物理', '電磁気学', '回路'),
('物理', '電磁気学', '電流と磁場'),
('物理', '電磁気学', '電磁誘導・交流'),
('物理', '原子', '電子と光'),
('物理', '原子', '原子核'),
('物理', '原子', '素粒子'),

-- 化学
('化学', '理論化学', '物質の構成と化学結合'),
('化学', '理論化学', '物質の状態'),
('化学', '理論化学', '化学反応とエネルギー'),
('化学', '理論化学', '反応速度と化学平衡'),
('化学', '無機化学', '非金属元素'),
('化学', '無機化学', '典型金属元素'),
('化学', '無機化学', '遷移金属元素'),
('化学', '有機化学', '脂肪族化合物'),
('化学', '有機化学', '芳香族化合物'),
('化学', '有機化学', '有機化合物の反応'),
('化学', '有機化学', '高分子化合物'),

-- 生物
('生物', '生命現象と物質', '細胞・分子'),
('生物', '生命現象と物質', '代謝'),
('生物', '生命現象と物質', '遺伝情報の発現'),
('生物', '生殖と発生', '生殖'),
('生物', '生殖と発生', '動物の発生'),
('生物', '生殖と発生', '植物の発生'),
('生物', '生物の環境応答', '恒常性-体液・免疫'),
('生物', '生物の環境応答', '反応と調節-神経・内分泌・行動'),
('生物', '生態と環境', '個体群と生物群集'),
('生物', '生態と環境', '生態系'),
('生物', '進化と系統', '生物の進化'),
('生物', '進化と系統', '生物の系統'),

-- 地学
('地学', '固体地球', '地球の構造'),
('地学', '固体地球', 'プレートテクトニクス'),
('地学', '固体地球', '火山と地震'),
('地学', '固体地球', '岩石・鉱物'),
('地学', '地球の歴史', '地質年代'),
('地学', '地球の歴史', '古生物'),
('地学', '地球の歴史', '日本の地質'),
('地学', '大気と海洋', '大気の構造と運動'),
('地学', '大気と海洋', '海洋の構造と運動'),
('地学', '大気と海洋', '気象'),
('地学', '宇宙', '太陽系'),
('地学', '宇宙', '恒星と銀河'),
('地学', '宇宙', '宇宙の構造'),

-- 世界史
('世界史', '古代', 'オリエント・地中海世界'),
('世界史', '古代', 'アジアの古典文明'),
('世界史', '中世', 'ヨーロッパ世界'),
('世界史', '中世', 'イスラーム世界'),
('世界史', '中世', 'アジア諸地域'),
('世界史', '近世', '主権国家体制の形成'),
('世界史', '近世', 'アジア諸帝国'),
('世界史', '近代', '欧米の発展と世界の植民地化'),
('世界史', '近代', 'アジアの変革'),
('世界史', '現代', '二つの世界大戦'),
('世界史', '現代', '冷戦'),
('世界史', '現代', '冷戦後の世界'),
('世界史', 'テーマ史', '地域間交流史'),
('世界史', 'テーマ史', '文化史'),
('世界史', 'テーマ史', '社会史'),

-- 日本史
('日本史', '原始・古代', '先史時代'),
('日本史', '原始・古代', 'ヤマト政権'),
('日本史', '原始・古代', '律令国家'),
('日本史', '原始・古代', '摂関政治'),
('日本史', '中世', '院政'),
('日本史', '中世', '鎌倉幕府'),
('日本史', '中世', '室町幕府'),
('日本史', '中世', '戦国時代'),
('日本史', '近世', '織豊政権'),
('日本史', '近世', '江戸幕府'),
('日本史', '近世', '幕藩体制の動揺'),
('日本史', '近代・現代', '明治時代'),
('日本史', '近代・現代', '大正・昭和初期'),
('日本史', '近代・現代', '戦後'),
('日本史', '近代・現代', '現代'),
('日本史', 'テーマ史', '政治史'),
('日本史', 'テーマ史', '外交史'),
('日本史', 'テーマ史', '社会経済史'),
('日本史', 'テーマ史', '文化史'),

-- 地理
('地理', '系統地理', '自然環境'),
('地理', '系統地理', '資源・産業'),
('地理', '系統地理', '人口・都市'),
('地理', '系統地理', '生活・文化'),
('地理', '系統地理', '地図・GIS'),
('地理', '地誌', 'アジア・オセアニア'),
('地理', '地誌', 'ヨーロッパ'),
('地理', '地誌', 'アフリカ'),
('地理', '地誌', '北アメリカ'),
('地理', '地誌', '南アメリカ'),

-- 情報
('情報', '情報社会と倫理', '情報社会'),
('情報', '情報社会と倫理', '情報デザイン'),
('情報', '情報社会と倫理', '法規・制度'),
('情報', '情報社会と倫理', '情報モラル'),
('情報', 'コンピュータ・システム', 'コンピュータの仕組み'),
('情報', 'コンピュータ・システム', 'ハードウェア'),
('情報', 'コンピュータ・システム', 'ソフトウェア'),
('情報', 'プログラミング・データ', 'アルゴリズム'),
('情報', 'プログラミング・データ', 'プログラミング'),
('情報', 'プログラミング・データ', 'データ構造'),
('情報', 'プログラミング・データ', 'データベース'),
('情報', 'ネットワーク・セキュリティ', 'ネットワーク技術'),
('情報', 'ネットワーク・セキュリティ', 'Web技術'),
('情報', 'ネットワーク・セキュリティ', '情報セキュリティ');
